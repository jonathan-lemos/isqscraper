import cheerio from "cheerio";
import request from "request";
import { QScraperEntry } from "../frontend/QScraper";

export const scrapeCourseCode = async (coursecode: string) => new Promise<QScraperEntry[]>((resolve, reject) => {
	const url = `https://banner.unf.edu/pls/nfpo/wksfwbs.p_course_isq_grade?pv_course_id=${coursecode}`;
	request(url, {}, (error, response, html) => {
		if (error) {
			reject(error);
			return;
		}
		const $ = cheerio.load(html);
		try {
			const elements = $("html > body > font > div.pagebodydiv > table.datadisplaytable > tbody")[3]
			.children.filter(c => c.type === "tag" && c.name === "tr");
			if (elements == null) {
				throw new Error("Malformed webpage");
			}
			/*
			console.log(
				elements
				.slice(3)
				.filter(e => e.children !== undefined)[0]
				.children
				.filter(
					e => e.type === "tag" && e.name === "th" && e.children[0].data !== undefined && e.children[0].data.trim() !== "",
				)[0],
			);
			*/
			const res = elements.slice(2).map(e => {
				const nc = e.children.filter(c => c.type === "tag" && c.name === "td");
				return {
					coursecode,
					crn: parseInt(nc[1].children[0].data as string, 10),
					isq: parseFloat((nc[12].children[1].children[0].data as string).trim()),
					professor: nc[2].children[0].data as string,
					term: (nc[0].children[0].data as string).split(/\s+/)[0],
					year: parseInt((nc[0].children[0].data as string).split(/\s+/)[1], 10),
				};
			});
			resolve(res);
		}
		catch (e) {
			reject(new Error(`Failed to parse: ${e.message}`));
		}
	});
});
