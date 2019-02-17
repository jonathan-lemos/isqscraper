import cheerio from "cheerio";
import request from "request";

export type QScraperEntryTerm = "Spring" | "Summer" | "Fall";

export interface QScraperEntry {
	coursecode: string;
	crn: number;
	isq: number;
	professor: string;
	term: QScraperEntryTerm;
	year: number;
}

export const scrapeCourseCode = async (coursecode: string) => new Promise<QScraperEntry[]>((resolve, reject) => {
	const url = `https://banner.unf.edu/pls/nfpo/wksfwbs.p_course_isq_grade?pv_course_id=${coursecode}`;
	request(url, {}, (error, response, html) => {
		if (error) {
			reject(error);
			return;
		}
		const $ = cheerio.load(html);
		try {
			const table = Array.prototype.slice.call($("table").get(6).children[0].children).slice(2);
			resolve(table.map(e => {
				return {
					coursecode,
					crn: parseInt(e.children[1].innerText, 10),
					isq: parseFloat(e.children[12].innerText),
					professor: e.children[2].innerText,
					term: e.children[0].innerText.split(/\s+/)[0] as QScraperEntryTerm,
					year: parseInt(e.children[0].innerText.split(/\s+/)[1], 10),
				};
			}));
		}
		catch (e) {
			reject(e);
		}
	});
});
