import $ from "jquery";
import * as sets from "../backend/sets";
import SqlServer, { ScraperEntry } from "../backend/SqlServer";

export const ajaxCourseCode = (coursecode: string): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => ({
	sql: new Promise<ScraperEntry[]>((resolve, reject) => {
		const url = `${document.location.protocol}//${document.location.hostname}/api/allEntries`;
		$.ajax({
			data: coursecode,
			error: err => reject(err),
			success: (result: ScraperEntry[]) => {
				if (!Array.isArray(result)) {
					reject(result);
					return;
				}
				resolve(result);
				return;
			},
			type: "POST",
			url,
		});
	}),
	web: new Promise<ScraperEntry[]>((resolve, reject) => {
		const url = `${document.location.protocol}//${document.location.hostname}/api/scrape?coursecode=${coursecode}`;
		$.ajax({
			error: err => reject(err),
			success: (result: ScraperEntry[]) => {
				if (!Array.isArray(result)) {
					reject(result);
					return;
				}
				resolve(result);
				return;
			},
			url,
		});
	}),
});

export const ajaxNNumber = (nnumber: string, lname: string): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => ({
	sql: new Promise<ScraperEntry[]>((resolve, reject) => {
		const url = `${document.location.protocol}//${document.location.hostname}/api/getByNNumber`;
		$.ajax({
			data: nnumber,
			error: err => reject(err),
			success: (result: ScraperEntry[]) => {
				if (!Array.isArray(result)) {
					reject(result);
					return;
				}
				resolve(result);
				return;
			},
			type: "POST",
			url,
		});
	}),
	web: new Promise<ScraperEntry[]>((resolve, reject) => {
		const url = `${document.location.protocol}//${document.location.hostname}/api/scrape?nnumber=${nnumber.toUpperCase()}&lname=${lname}`;
		$.ajax({
			error: err => reject(err),
			success: (result: ScraperEntry[]) => {
				if (!Array.isArray(result)) {
					reject(result);
					return;
				}
				resolve(result);
				return;
			},
			url,
		});
	}),
});

export const ajaxName = ({ fname = "", lname = "" }): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	if (fname === "" && lname === "") {
		return { sql: Promise.resolve([]), web: Promise.resolve([]) };
	}
	else if (fname !== "" && lname !== "") {
		return {
			sql: new Promise<ScraperEntry[]>((resolve, reject) => {
				const url = `${document.location.protocol}//${document.location.hostname}/api/getByName`;
				$.ajax({
					data: {fname, lname},
					error: err => reject(err),
					success: (result: ScraperEntry[]) => {
						if (!Array.isArray(result)) {
							reject(result);
							return;
						}
						resolve(result);
						return;
					},
					type: "POST",
					url,
				});
			}),
			web: new Promise<ScraperEntry[]>((resolve, reject) => {
				const getNno = async () => {
					const url = `${document.location.protocol}//${document.location.hostname}/api/nameToNNumber`;
					$.ajax({
						data: { fname, lname },
						error: err => reject(err),
						success: (result: ScraperEntry[]) => {
							if (!Array.isArray(result)) {
								reject(result);
								return;
							}
							resolve(result);
							return;
						},
						type: "POST",
						url,
					});
				}
			}),
		};
		return await ajaxNNumber(nNumber, lname);
	}
	else if (fname !== "") {
		const nNumber = await con.fnameToNNumber(fname);
		if (nNumber === null) {
			resolve([]);
			return;
		}
		return await ajaxNNumber(nNumber, lname);
	}
	else {
		const nNumber = await con.lnameToNNumber(fname);
		if (nNumber === null) {
			resolve([]);
			return;
		}
		return await ajaxNNumber(nNumber, lname);
	}
});

export const updateSql = async (results: ScraperEntry[], con: SqlServer): Promise<void> => {
	const d = sets.diff(results, await con.allEntries());
	con.insert(d.a);
	con.delete(d.b);
};
