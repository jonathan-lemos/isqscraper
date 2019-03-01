import $ from "jquery";
import * as sets from "../backend/sets";
import SqlServer, { ScraperEntry } from "../backend/sql";

export const ajaxCourseCode = async (coursecode: string) => new Promise<ScraperEntry[]>((resolve, reject) => {
	const url = `${document.location.protocol}//${document.location.hostname}/scrape?coursecode=${coursecode}`;
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
});

export const ajaxNNumber = async (nnumber: string, lname: string) => new Promise<ScraperEntry[]>((resolve, reject) => {
	const url = `${document.location.protocol}//${document.location.hostname}/scrape?nnumber=${nnumber.toUpperCase()}&lname=${lname}`;
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
});

export const ajaxName = async ({ fname = "", lname = "" }, con: SqlServer) => new Promise<ScraperEntry[]>(async (resolve, reject) => {
	if (fname === "" && lname === "") {
		return Promise.resolve([]);
	}
	else if (fname !== "" && lname !== "") {
		const nNumber = await con.nameToNNumber(fname, lname);
		return await ajaxNNumber(nNumber, lname);
	}
	else if (fname !== "") {
		const nNumber = await con.fnameToNNumber(fname);
		return await ajaxNNumber(nNumber, lname);
	}
	else {
		const nNumber = await con.lnameToNNumber(fname);
		return await ajaxNNumber(nNumber, lname);
	}
});

export const updateSql = async (results: ScraperEntry[], con: SqlServer): Promise<void> => {
	const d = sets.diff(results, await con.allEntries());
	con.insert(d.a);
	con.delete(d.b);
};
