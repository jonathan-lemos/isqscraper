import express from "express";
import path from "path";
import { scrapeCourseCode } from "./scraper";

const port = 80;

const server = express();
server.use(express.static(path.normalize(path.join("..", "site"))));
server.get("/", (req, res) => res.sendFile(path.normalize(path.join("..", "site"))));
server.get("/scrape", async (req, res) => {
	if (req.query.coursecode !== undefined) {
		res.json(JSON.stringify(await scrapeCourseCode(req.query.coursecode)));
	}
	else {
		res.send(`Query params need to include "coursecode"`);
	}
});
server.listen(port, () => console.log(`Express listening on port ${port}`));
