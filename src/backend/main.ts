import express from "express";
import path from "path";
import { scrapeCourseCode } from "./scraper";
import SqlServer from "./sql";

const main = async () => {
	const sql = await SqlServer.create("localhost", "root", "toor");
	const arr = await scrapeCourseCode("COP3503");
	sql.insert(arr);
	sql.delete(arr.slice(1));
	sql.end();
};

main();

/*
const port = 80;

const siteBaseDir = path.join(__dirname, "../site");

const server = express();
server.use(express.static(siteBaseDir));
server.get("/", (req, res) => res.sendFile(path.join(siteBaseDir, "/index.html")));
server.get("/scrape", async (req, res) => {
	if (req.query.coursecode !== undefined) {
		let arr: QScraperEntry[];
		try {
			arr = await scrapeCourseCode(req.query.coursecode);
		}
		catch (e) {
			res.send(`Failed to scrape course code: "${e.message}"`);
			return;
		}
		res.json(arr);
	}
	else {
		res.send(`Query params need to include "coursecode"`);
	}
});
server.listen(port, () => console.log(`Express listening on port ${port}`));
*/
