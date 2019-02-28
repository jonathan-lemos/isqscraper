import SqlServer, { ScraperEntry } from "./sql";

const getSqlCourseCode = async (coursecode: string, con: SqlServer): Promise<ScraperEntry[]> => con.getByCourseCode(coursecode);

const getWebCourseCode = async (coursecode: string) => new Promise<ScraperEntry[]>((resolve, reject) => {
	const url = `${document.location.protocol}//${document.location.hostname}/scrape?coursecode=${coursecode}`;
	$.ajax({
		error: err => reject(err),
		success: (result: ScraperEntry[]) => {
			if (!Array.isArray(result)) {
				reject(result);
			}
			try {
				resolve(result);
				return;
			}
			catch (e) {
				reject(e);
			}
		},
		url,
	});
});
