import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import { webScrapeCourseCode, webScrapeNNumber } from "./scraper";
import { diff } from "./sets";
import SqlServer, { ScraperEntry } from "./SqlServer";

const updateSqlServer = async (con: SqlServer, entries: ScraperEntry[]): Promise<void> => {
	const d = diff(entries, await con.allEntries());
	con.delete(d.b);
	con.insert(d.a);
};

export default class WebServer {
	public static makeAppServer = (con: SqlServer, port: number = 80, baseDir: string = path.join(__dirname, "../site"), defaultFile: string = "index.html"): WebServer => {
		const ret = new WebServer(con, port, baseDir, defaultFile);
		ret.web.get("/api/scrape", async (req, res) => {
			if (req.query.coursecode !== undefined) {
				let arr: ScraperEntry[];
				try {
					arr = await webScrapeCourseCode(req.query.coursecode);
					updateSqlServer(con, arr);
					res.json(arr);
					return;
				}
				catch (e) {
					res.status(400).send(`Failed to scrape course code: "${e.message}"`);
					return;
				}
			}
			else if (req.query.nnumber !== undefined && req.query.lname !== undefined) {
				let arr: ScraperEntry[];
				try {
					arr = await webScrapeNNumber(req.query.nnumber, req.query.lname);
					updateSqlServer(con, arr);
					res.json(arr);
					return;
				}
				catch (e) {
					res.status(400).send(`Failed to scrape course code: "${e.message}"`);
					return;
				}
			}
			else {
				res.status(400).send(`Query params need to include "?coursecode=XXX0000" or "?nnumber=N00000000&lname=Example"`);
			}
		});
		ret.web.get("/api/allEntries", async (req, res) => res.json(await ret.con.allEntries()));
		ret.web.get("/api/allFirstNames", async (req, res) => res.json(await ret.con.allFirstNames()));
		ret.web.get("/api/allLastNames", async (req, res) => res.json(await ret.con.allLastNames()));
		ret.web.get("/api/allNames", async (req, res) => res.json(await ret.con.allNames()));
		ret.web.get("/api/allProfessors", async (req, res) => res.json(await ret.con.allProfessors()));
		ret.web.get("/api/allQueriedCourseCodes", async (req, res) => res.json(await ret.con.allQueriedCourseCodes()));
		ret.web.get("/api/allQueriedNames", async (req, res) => res.json(await ret.con.allQueriedNames()));
		ret.web.post("/api/fnameToLname", async (req, res) => res.json(await ret.con.fnameToLname(req.body.str)));
		ret.web.post("/api/fnameToNNumber", async (req, res) => res.json(await ret.con.fnameToNNumber(req.body.str)));
		ret.web.post("/api/getByCourseCode", async (req, res) => res.json(await ret.con.getByCourseCode(req.body.str)));
		ret.web.post("/api/getByFirstName", async (req, res) => res.json(await ret.con.getByFirstName(req.body.str)));
		ret.web.post("/api/getByLastName", async (req, res) => res.json(await ret.con.getByLastName(req.body.str)));
		ret.web.post("/api/getByName", async (req, res) => res.json(await ret.con.getByName(req.body.fname, req.body.lname)));
		ret.web.post("/api/getByNNumber", async (req, res) => res.json(await ret.con.getByNNumber(req.body.str)));
		ret.web.post("/api/lnameToFname", async (req, res) => res.json(await ret.con.lnameToFname(req.body.str)));
		ret.web.post("/api/lnameToNNumber", async (req, res) =>
		res.json(await ret.con.lnameToNNumber(req.body.str)));
		ret.web.post("/api/nameToNNumber", async (req, res) => res.json(await ret.con.nameToNNumber(req.body.fname, req.body.lname)));
		return ret;
	}

	private con: SqlServer;
	private web: express.Application;
	private port: number;
	private nodeServer: http.Server | null;

	constructor(con: SqlServer, port: number = 80, baseDir: string = path.join(__dirname, "../site"), defaultFile: string = "index.html") {
		this.nodeServer = null;
		this.con = con;
		this.port = port;
		this.web = express();
		this.web.use(express.static(baseDir));
		this.web.use(express.json());
		this.web.use(cors());
		this.web.get("/", (req, res) => res.sendFile(path.join(baseDir, defaultFile)));
	}

	public end() {
		if (this.nodeServer !== null) {
			this.nodeServer.close();
		}
		this.con.end();
	}

	public async listen(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.nodeServer = this.web.listen(this.port, () => resolve());
		});
	}
}
