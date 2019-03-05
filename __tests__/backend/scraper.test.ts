import { webScrapeCourseCode, webScrapeNNumber } from "../../src/backend/scraper";
import SqlServer from "../../src/backend/SqlServer";
import WebServer from "../../src/backend/WebServer";

describe("scraper tests", async () => {
	it("scrapes course code correctly", async () => {
		const s = await SqlServer.create({ user: "root", password: "toor" });
		const w = new WebServer(s, 3000);

		try {
			const arr = await webScrapeCourseCode("COP3503");
			console.log(arr);
			expect(arr.length).toBeGreaterThanOrEqual(10);
		}
		catch (e) {
			console.log(e);
			expect(false).toEqual(true);
		}
		try {
			await webScrapeCourseCode("COP9999");
		}
		catch (e) {
			return;
		}
		expect(false).toEqual(true);
	});

	it("scrapes n number correctly", async () => {
		const s = await SqlServer.create({ user: "root", password: "toor" });
		const w = new WebServer(s);

		try {
			const arr = await webScrapeNNumber("N01237497");
			expect(arr.length).toBeGreaterThanOrEqual(10);
		}
		catch (e) {
			console.log(e);
			expect(false).toEqual(true);
		}
		try {
			await webScrapeNNumber("N99999999");
		}
		catch (e) {
			return;
		}
		expect(false).toEqual(true);
	});
});
