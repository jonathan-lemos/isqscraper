import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import { ScraperEntry } from "../dbentries";
import { webScrapeCourseCode, webScrapeNNumber } from "./scraper";
import { diff } from "./sets";
import SqlServer from "./SqlServer";

export const updateSqlServer = async (con: SqlServer, webEntries: ScraperEntry[], sqlEntries: ScraperEntry[]): Promise<void> => {
	const d = diff(webEntries, sqlEntries);
	await Promise.all([con.insert(d.a), con.delete(d.b)]);
};

export default class WebServer {
	/**
	 * Sends an error as a response.
	 *
	 * @param r The express response object.
	 * @param s The message to send. This can be a string or HTML.
	 */
	private static sendError = (r: express.Response, s: string) => {
		r.status(400).send(s);
	}

	private con: SqlServer;
	private web: express.Application;
	private port: number;
	private nodeServer: http.Server | null;

	/**
	 * Makes a web server with the correct api endpoints for our app.
	 * Giving extra query parameters or undefined query parameters gives an undefined result.
	 * All api endpoints return a json object:
	 *     /api/list - Lists all x in the database:
	 *         ?type=coursecode - Lists all coursecodes. Return type: string[]
	 *         ?type=fname      - Lists all first names. Return type: string[]
	 *         ?type=lname      - Lists all last names.  Return type: string[]
	 *         ?type=name       - Lists all names.       Return type: {fname: string, lname: string}[]
	 *         ?type=nnumber    - Lists all n-numbers.   Return type: string[]
	 *     /api/nameToNNumber - Turns a name into an n-number:
	 *         ?fname=John           - Returns all n-numbers with the given first name. Return type: string[]
	 *         ?lname=Doe            - Returns all n-numbers with the given last name.  Return type: string[]
	 *         ?fname=John&lname=Doe - Returns all n-numbers with the given full name.  Return type: string[]
	 *     /api/scrape - Scrapes the Department Schedule for information:
	 *         ?coursecode=COP3503 - Lists all ISQ entries that match the given coursecode. Return type: ScraperEntry[].
	 *         ?nnumber=n01234567  - Lists all ISQ entries that match the given n-number.   Return type: ScraperEntry[].
	 *     /api/select - Selects information from the SQL database:
	 *         ?coursecode=COP3503   - Lists all ISQ entries that match the given coursecode. Return type: ScraperEntry[].
	 *         ?fname=John           - Lists all ISQ entries that match the given first name. Return type: ScraperEntry[].
	 *         ?lname=Doe            - Lists all ISQ entries that match the given last name.  Return type: ScraperEntry[].
	 *         ?fname=John&lname=Doe - Lists all ISQ entries that match the given full name.  Return type: ScraperEntry[].
	 *         ?nnumber=n01234567    - Lists all ISQ entries that match the given n-number.   Return type: ScraperEntry[].
	 *         <blank>               - Lists all ISQ entries.                                 Return type: ScraperEntry[].
	 *
	 * @param con         The SQL server to connect to.
	 * @param port        The port to host on. By default this is port 80.
	 * @param baseDir     The directory to host out of. By default this is "../site"
	 * @param defaultFile The file to host at "/". By default this is "index.html"
	 */
	constructor(con: SqlServer, port: number = 80, baseDir: string = path.join(__dirname, "../site"), defaultFile: string = "index.html") {
		this.nodeServer = null;
		this.con = con;
		this.port = port;
		this.web = express();
		this.web.use(express.static(baseDir));
		this.web.use(express.json());
		this.web.use(cors());
		this.web.get("/", (req, res) => res.sendFile(path.join(baseDir, defaultFile)));

		this.web.get("/api/list", async (req, res) => {
			if (req.query.type === undefined) {
				WebServer.sendError(res, `
/api/list needs a query parameter "type":
type=coursecode - Course codes
type=fname      - First names
type=lname      - Last names
type=name       - Names
type=nnumber    - N Numbers
				`.trim());
				return;
			}
			try {
				switch (req.query.type) {
					case "coursecode":
						return await this.con.allQueriedCourseCodes();
					case "fname":
						return await this.con.allFirstNames();
					case "lname":
						return await this.con.allLastNames();
					case "name":
						return await this.con.allNames();
					case "nnumber":
						return await this.con.allNNumbers();
				}
			}
			catch (e) {
				WebServer.sendError(res, e.message);
			}
		});

		this.web.get("/api/nameToNNumber", async (req, res) => {
			let a: string[];
			try {
				if (req.query.fname !== undefined && req.query.lname !== undefined) {
					a = await this.con.nameToNNumber(req.query.fname, req.query.lname);
				}
				else if (req.query.fname !== undefined) {
					a = await this.con.fnameToNNumber(req.query.fname);
				}
				else if (req.query.lname !== undefined) {
					a = await this.con.lnameToFname(req.query.lname);
				}
				else {
					WebServer.sendError(res, `
/api/nameToNNumber needs any of the following query parameters:
fname - First name
lname - Last name
					`.trim());
					return;
				}
				res.json(a);
			}
			catch (e) {
				WebServer.sendError(res, e.message);
			}
		});

		this.web.get("/api/scrape", async (req, res) => {
			if (req.query.coursecode !== undefined) {
				let arr: ScraperEntry[];
				try {
					arr = await webScrapeCourseCode(req.query.coursecode);
					updateSqlServer(con, arr, await con.getByCourseCode(req.query.coursecode));
					res.json(arr);
					return;
				}
				catch (e) {
					WebServer.sendError(res, `Failed to scrape course code: "${e.message}"`);
					return;
				}
			}
			if (req.query.fname !== undefined && req.query.lname !== undefined) {
				try {
					const nNumbers = await con.nameToNNumber(req.query.fname, req.query.lname);
					let arr: ScraperEntry[] = [];
					for (const x of nNumbers) {
						arr = arr.concat(await webScrapeNNumber(x));
						updateSqlServer(con, arr, await con.getByNNumber(x));
					}
					res.json(arr);
					return;
				}
				catch (e) {
					WebServer.sendError(res, `Failed to retrieve n numbers: "${e.message}"`);
					return;
				}
			}
			else if (req.query.fname !== undefined) {
				try {
					const nNumbers = await con.fnameToNNumber(req.query.fname);
					let arr: ScraperEntry[] = [];
					for (const x of nNumbers) {
						arr = arr.concat(await webScrapeNNumber(x));
						updateSqlServer(con, arr, await con.getByNNumber(x));
					}
					res.json(arr);
					return;
				}
				catch (e) {
					WebServer.sendError(res, `Failed to retrieve n numbers: "${e.message}"`);
					return;
				}
			}
			else if (req.query.lname !== undefined) {
				try {
					const nNumbers = await con.lnameToNNumber(req.query.lname);
					let arr: ScraperEntry[] = [];
					for (const x of nNumbers) {
						arr = arr.concat(await webScrapeNNumber(x));
						updateSqlServer(con, arr, await con.getByNNumber(x));
					}
					res.json(arr);
					return;
				}
				catch (e) {
					WebServer.sendError(res, `Failed to retrieve n numbers: "${e.message}"`);
					return;
				}
			}
			else if (req.query.nnumber !== undefined) {
				let arr: ScraperEntry[];
				try {
					arr = await webScrapeNNumber(req.query.nnumber);
					updateSqlServer(con, arr, await con.getByNNumber(req.query.nnumber));
					res.json(arr);
					return;
				}
				catch (e) {
					WebServer.sendError(res, `Failed to scrape course code: "${e.message}"`);
					return;
				}
			}
			else {
				WebServer.sendError(res, `Query params need to include "?coursecode=XXX0000" or "?nnumber=N00000000"`);
			}
		});

		this.web.get("/api/select", async (req, res) => {
			let a: ScraperEntry[];
			try {
				if (req.query.lname !== undefined && req.query.fname !== undefined) {
					a = await this.con.getByName(req.query.fname, req.query.lname);
				}
				else if (req.query.fname !== undefined && req.query.lname !== undefined) {
					a = await this.con.getByName(req.query.fname, req.query.lname);
				}
				else if (req.query.lname !== undefined) {
					a = await this.con.getByLastName(req.query.lname);
				}
				else if (req.query.fname !== undefined) {
					a = await this.con.getByFirstName(req.query.fname);
				}
				else if (req.query.nnumber !== undefined) {
					a = await this.con.getByFirstName(req.query.fname);
				}
				else if (req.query.coursecode !== undefined) {
					a = await this.con.getByCourseCode(req.query.coursecode);
				}
				else {
					a = await this.con.allEntries();
				}
				res.json(a);
			}
			catch (e) {
				WebServer.sendError(res, e.message);
			}
		});
	}

	/**
	 * Closes the web server.
	 * Do not attempt to use the WebServer after this command is run.
	 */
	public end() {
		if (this.nodeServer !== null) {
			this.nodeServer.close();
		}
		this.con.end();
	}

	/**
	 * Starts the web server.
	 */
	public async listen(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.nodeServer = this.web.listen(this.port, () => resolve());
		});
	}
}
