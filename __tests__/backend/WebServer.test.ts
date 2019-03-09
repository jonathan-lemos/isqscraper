import fs from "fs";
import * as sets from "../../src/backend/sets";
import SqlServer from "../../src/backend/SqlServer";
import WebServer, { updateSqlServer } from "../../src/backend/WebServer";
import * as ajax from "../../src/frontend/ajax";
import { debugSettings } from "../../src/settings";

let ws: WebServer | undefined;
let sq: SqlServer | undefined;

const sqlLoginInfo = Object.freeze({
	database: debugSettings.sqlDbName,
	password: debugSettings.sqlPassword,
	user: debugSettings.sqlUser,
});

const getServerCon = async (): Promise<SqlServer> => {
	if (sq !== undefined) {
		return sq;
	}
	const q = await SqlServer.create(sqlLoginInfo);
	q.nuke();
	const r = await SqlServer.create(sqlLoginInfo);
	const csv = fs.readFileSync(debugSettings.professorCsvPath).toString().split("\n");
	await r.insertProfessorsFromCsv(csv);
	sq = r;
	return r;
};

const makeServer = async (): Promise<WebServer> => {
	if (ws !== undefined) {
		return ws;
	}
	const w = new WebServer(await getServerCon(), 3000);
	await w.listen();
	ws = w;
	return w;
};

const origin = "http://localhost:3000";

describe("WebServer tests", () => {
	beforeEach(() => {
		jest.setTimeout(20000);
	});

	it("updates sql server correctly", async () => {
		const con = await SqlServer.create({ database: "isqscraper_sql_update_test", user: sqlLoginInfo.user, password: sqlLoginInfo.password });
		const profs = [
			{ fname: "redferrari", lname: "sandy", nnumber: "n01234567" },
			{ fname: "faze", lname: "painman", nnumber: "n22222222" },
			{ fname: "ree", lname: "eggman", nnumber: "n00000001" },
		];
		const arr = [
			{ coursecode: "COP3503", crn: 69696, isq: 4.69, lname: "sandy", term: "Summer", year: 2018 },
			{ coursecode: "COP3503", crn: 69697, isq: 3.69, lname: "painman", term: "Spring", year: 2018 },
			{ coursecode: "COP9999", crn: 99999, isq: 2.69, lname: "painman", term: "Spring", year: 2018 },
		];
		const entry = { coursecode: "COP9999", crn: 88888, isq: 5.00, lname: "eggman", term: "Fall", year: 2017 };
		await con.insert(profs);
		await updateSqlServer(con, arr, await con.allEntries());
		expect(sets.equivalent(await con.allEntries(), arr)).toEqual(true);
		await updateSqlServer(con, arr, await con.allEntries());
		expect(sets.equivalent(await con.allEntries(), arr)).toEqual(true);
		await updateSqlServer(con, [entry], await con.allEntries());
		expect(sets.equivalent(await con.allEntries(), [entry])).toEqual(true);
		await updateSqlServer(con, arr, []);
		expect(sets.equivalent(await con.allEntries(), arr.concat(entry))).toEqual(true);
		con.nuke();
	});

	it("responds to ajax coursecode", async () => {
		return makeServer().then(async () => {
			const promises1 = ajax.ajaxCourseCode("COP3503", origin);
			const res1 = { sql: await promises1.sql, web: await promises1.web };
			expect(res1.web.length).toBeGreaterThanOrEqual(10);
			const promises2 = ajax.ajaxCourseCode("COP3503", origin);
			const res2 = { sql: await promises2.sql, web: await promises2.web };
			expect(res2.sql.length).toBeGreaterThanOrEqual(10);
			expect(res2.web.length).toBeGreaterThanOrEqual(10);
		});
	});

	it("responds to ajax nnumber", async () => {
		return makeServer().then(async () => {
			const promises1 = ajax.ajaxNNumber("N01237497", origin);
			const res1 = { sql: await promises1.sql, web: await promises1.web };
			expect(res1.web.length).toBeGreaterThanOrEqual(10);
			const promises2 = ajax.ajaxNNumber("n01237497", origin);
			const res2 = { sql: await promises2.sql, web: await promises2.web };
			expect(res2.sql.length).toBeGreaterThanOrEqual(10);
			expect(res2.web.length).toBeGreaterThanOrEqual(10);
		});
	});

	it("responds to ajax fullname", async () => {
		return makeServer().then(async () => {
			const promises1 = ajax.ajaxName({ fname: "Sandeep", lname: "Reddivari" }, origin);
			const res1 = { sql: await promises1.sql, web: await promises1.web };
			expect(res1.web.length).toBeGreaterThanOrEqual(10);
			const promises2 = ajax.ajaxFullName("Sandeep", "Reddivari", origin);
			const res2 = { sql: await promises2.sql, web: await promises2.web };
			expect(res2.sql.length).toBeGreaterThanOrEqual(10);
			expect(res2.web.length).toBeGreaterThanOrEqual(10);
		});
	});

	it("responds to ajax lastname", async () => {
		return makeServer().then(async () => {
			const promises1 = ajax.ajaxName({ lname: "Reddivari" }, origin);
			const res1 = { sql: await promises1.sql, web: await promises1.web };
			expect(res1.web.length).toBeGreaterThanOrEqual(10);
			const promises2 = ajax.ajaxLastName("Reddivari", origin);
			const res2 = { sql: await promises2.sql, web: await promises2.web };
			expect(res2.sql.length).toBeGreaterThanOrEqual(10);
			expect(res2.web.length).toBeGreaterThanOrEqual(10);
		});
	});

	it("responds to ajax firstname", async () => {
		return makeServer().then(async () => {
			const promises1 = ajax.ajaxFirstName("Sandeep", origin);
			const res1 = { sql: await promises1.sql, web: await promises1.web };
			expect(res1.web.length).toBeGreaterThanOrEqual(10);
			const promises2 = ajax.ajaxName({ fname: "Sandeep" }, origin);
			const res2 = { sql: await promises2.sql, web: await promises2.web };
			expect(res2.sql.length).toBeGreaterThanOrEqual(10);
			expect(res2.web.length).toBeGreaterThanOrEqual(10);
		});
	});
});

if (ws !== undefined) {
	ws.end();
}
