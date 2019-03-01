import cheerio from "cheerio";
import express from "express";
import path from "path";
import request from "request";
import { webScrapeCourseCode, webScrapeNNumber } from "./webscraper";
import { ScraperEntry } from "./sql";


const port = 80;

const siteBaseDir = path.join(__dirname, "../site");

const server = express();
server.use(express.static(siteBaseDir));
server.get("/", (req, res) => res.sendFile(path.join(siteBaseDir, "/index.html")));
server.get("/scrape", async (req, res) => {
	if (req.query.coursecode !== undefined) {
		let arr: ScraperEntry[];
		try {
			arr = await webScrapeCourseCode(req.query.coursecode);
		}
		catch (e) {
			res.send(`Failed to scrape course code: "${e.message}"`);
			return;
		}
		res.json(arr);
	}
	else if (req.query.nnumber !== undefined && req.query.lname !== undefined) {
		let arr: ScraperEntry[];
		try {
			arr = await webScrapeNNumber(req.query.nnumber, req.query.lname);
		}
		catch (e) {
			res.send(`Failed to scrape course code: "${e.message}"`);
			return;
		}
		res.json(arr);
	}
	else {
		res.send(`Query params need to include "?coursecode=XXX0000" or "?nnumber=N00000000&lname=Example"`);
	}
});
server.listen(port, () => console.log(`Express listening on port ${port}`));
