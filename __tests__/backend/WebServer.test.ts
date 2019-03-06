import SqlServer from "../../src/backend/SqlServer";
import WebServer from "../../src/backend/WebServer";
import * as ajax from "../../src/frontend/ajax";

let wserver: WebServer | undefined;
const makeServer = async (): Promise<WebServer> => {
	if (wserver !== undefined) {
		return wserver;
	}
	const con = await SqlServer.create({ database: "isqscraper_test", user: "root", password: "toor" });
	const w = new WebServer(con, 3000);
	await w.listen();
	wserver = w;
	return w;
};

describe("WebServer tests", async () => {
	it("initializes the web server", async () => {
		const ws = await makeServer();
	});

	it("responds to ajax coursecode", async () => {
		await makeServer();
		const promises1 = ajax.ajaxCourseCode("COP3503");
		const res1 = { sql: await promises1.sql, web: await promises1.web };
		expect(res1.web.length).toBeGreaterThanOrEqual(10);
		const promises2 = ajax.ajaxCourseCode("COP3503");
		const res2 = { sql: await promises2.sql, web: await promises2.web };
		expect(res2.sql.length).toBeGreaterThanOrEqual(10);
		expect(res2.web.length).toBeGreaterThanOrEqual(10);
	});

	it("responds to ajax nnumber", async () => {
		await makeServer();
		const promises1 = ajax.ajaxNNumber("N01237497");
		const res1 = { sql: await promises1.sql, web: await promises1.web };
		expect(res1.web.length).toBeGreaterThanOrEqual(10);
		const promises2 = ajax.ajaxNNumber("n01237497");
		const res2 = { sql: await promises2.sql, web: await promises2.web };
		expect(res2.sql.length).toBeGreaterThanOrEqual(10);
		expect(res2.web.length).toBeGreaterThanOrEqual(10);
	});

	it("responds to ajax fullname", async () => {
		await makeServer();
		const promises1 = ajax.ajaxName({ fname: "Sandeep", lname: "Reddivari" });
		const res1 = { sql: await promises1.sql, web: await promises1.web };
		expect(res1.web.length).toBeGreaterThanOrEqual(10);
		const promises2 = ajax.ajaxFullName("Sandeep", "Reddivari");
		const res2 = { sql: await promises2.sql, web: await promises2.web };
		expect(res2.sql.length).toBeGreaterThanOrEqual(10);
		expect(res2.web.length).toBeGreaterThanOrEqual(10);
	});

	it("responds to ajax lastname", async () => {
		await makeServer();
		const promises1 = ajax.ajaxName({ lname: "Reddivari" });
		const res1 = { sql: await promises1.sql, web: await promises1.web };
		expect(res1.web.length).toBeGreaterThanOrEqual(10);
		const promises2 = ajax.ajaxLastName("Reddivari");
		const res2 = { sql: await promises2.sql, web: await promises2.web };
		expect(res2.sql.length).toBeGreaterThanOrEqual(10);
		expect(res2.web.length).toBeGreaterThanOrEqual(10);
	});

	it("responds to ajax firstname", async () => {
		await makeServer();
		const promises1 = ajax.ajaxFirstName("Sandeep");
		const res1 = { sql: await promises1.sql, web: await promises1.web };
		expect(res1.web.length).toBeGreaterThanOrEqual(10);
		const promises2 = ajax.ajaxName({ fname: "Sandeep" });
		const res2 = { sql: await promises2.sql, web: await promises2.web };
		expect(res2.sql.length).toBeGreaterThanOrEqual(10);
		expect(res2.web.length).toBeGreaterThanOrEqual(10);
	});
});
