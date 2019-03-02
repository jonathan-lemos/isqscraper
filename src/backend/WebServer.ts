import express from "express";
import path from "path";
import { webScrapeCourseCode, webScrapeNNumber } from "./scraper";
import { diff } from "./sets";
import SqlServer, { ScraperEntry } from "./SqlServer";

const updateSqlServer = async (con: SqlServer, entries: ScraperEntry[]): Promise<void> => {
	const d = diff(entries, await con.allEntries());
	con.delete(d.b);
	con.insert(d.a);
};

export const makeAppServer = (con: SqlServer, port: number = 80, baseDir: string = path.join(__dirname, "../site"), defaultFile: string = "index.html"): WebServer => {
	const ret = new WebServer(con, port, baseDir, defaultFile);
	ret.getApi("/api/scrape", async query => {
		if (query.coursecode !== undefined) {
			let arr: ScraperEntry[];
			try {
				arr = await webScrapeCourseCode(query.coursecode);
				updateSqlServer(con, arr);
			}
			catch (e) {
				return `Failed to scrape course code: "${e.message}"`;
			}
			return arr;
		}
		else if (query.nnumber !== undefined && query.lname !== undefined) {
			let arr: ScraperEntry[];
			try {
				arr = await webScrapeNNumber(query.nnumber, query.lname);
				updateSqlServer(con, arr);
			}
			catch (e) {
				return `Failed to scrape course code: "${e.message}"`;
			}
			return arr;
		}
		else {
			return `Query params need to include "?coursecode=XXX0000" or "?nnumber=N00000000&lname=Example"`;
		}
	});
	ret.getApi("/api/allEntries", async (query, sql) => await sql.allEntries());
	ret.getApi("/api/allFirstNames", async (query, sql) => await sql.allFirstNames());
	ret.getApi("/api/allLastNames", async (query, sql) => await sql.allLastNames());
	ret.getApi("/api/allNames", async (query, sql) => await sql.allNames());
	ret.getApi("/api/allProfessors", async (query, sql) => await sql.allProfessors());
	ret.getApi("/api/allQueriedCourseCodes", async (query, sql) => await sql.allQueriedCourseCodes());
	ret.getApi("/api/allQueriedNames", async (query, sql) => await sql.allQueriedNames());
	ret.postApi("/api/fnameToLname", async (data, query, sql) => await sql.fnameToLname(data));
	ret.postApi("/api/fnameToNNumber", async (data, query, sql) => await sql.fnameToNNumber(data));
	ret.postApi("/api/getByCourseCode", async (data, query, sql) => await sql.getByCourseCode(data));
	ret.postApi("/api/getByFirstName", async (data, query, sql) => await sql.getByFirstName(data));
	ret.postApi("/api/getByLastName", async (data, query, sql) => await sql.getByLastName(data));
	ret.postApi("/api/getByName", async (data, query, sql) => await sql.getByName(data.fname, data.lname));
	ret.postApi("/api/getByNNumber", async (data, query, sql) => await sql.getByNNumber(data));
	ret.postApi("/api/lnameToFname", async (data, query, sql) => await sql.lnameToFname(data));
	ret.postApi("/api/lnameToNNumber", async (data, query, sql) => await sql.lnameToNNumber(data));
	ret.postApi("/api/nameToNNumber", async (data, query, sql) => await sql.nameToNNumber(data.fname, data.lname));
	return ret;
};

export default class WebServer {
	private con: SqlServer;
	private web: express.Application;
	private port: number;

	constructor(con: SqlServer, port: number = 80, baseDir: string = path.join(__dirname, "../site"), defaultFile: string = "index.html") {
		this.con = con;
		this.port = port;
		this.web = express();
		this.web.use(express.static(baseDir));
		this.web.use(express.json());
		this.web.get("/", (req, res) => res.sendFile(path.join(baseDir, defaultFile)));
	}

	public getApi(webpath: string, fn: (query: any, sql: SqlServer) => any) {
		const func = (query: express.Request, res: express.Response) => {
			const r = fn(query.query, this.con);
			if (r == null) {
				return;
			}
			res.send(r);
		};
		this.web.get(webpath, func);
	}

	public async listen(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.web.listen(this.port, () => resolve());
		});
	}

	public postApi(webpath: string, fn: (data: any, query: any, sql: SqlServer) => any) {
		const func = (query: express.Request, res: express.Response) => {
			const r = fn(query.body, query.params, this.con);
			if (r == null) {
				return;
			}
			res.send(r);
		};
		this.web.post(webpath, func);
	}
}
