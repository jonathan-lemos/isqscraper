import $ from "jquery";
import { isScraperEntry, ScraperEntry } from "../dbentries";

const getHost = () => document.location.origin;

async function ajaxGet<T>(url: string, isType: (a: any) => a is T) {
	return new Promise<T>((resolve, reject) => {
		$.ajax({
			error: reject,
			success: (a: any) => {
				if (!isType(a)) {
					reject(a);
					return;
				}
				resolve(a);
			},
			url,
		});
	});
}

const isStringArray = (s: any): s is string[] => {
	if (!Array.isArray(s)) {
		return false;
	}
	for (const c of s) {
		if (typeof c !== "string") {
			return false;
		}
	}
	return true;
};

const isScraperArray = (s: any): s is ScraperEntry[] => {
	if (!Array.isArray(s)) {
		return false;
	}
	for (const c of s) {
		if (!isScraperEntry(c)) {
			return false;
		}
	}
	return true;
};

export const ajaxCourseCode = (coursecode: string, origin: string = getHost()): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	const sqlUrl = `${origin}/api/select?coursecode=${coursecode.toUpperCase()}`;
	const webUrl = `${origin}/api/scrape?coursecode=${coursecode.toUpperCase()}`;
	return {
		sql: ajaxGet(sqlUrl, isScraperArray),
		web: ajaxGet(webUrl, isScraperArray),
	};
};

export const ajaxNNumber = (nnumber: string, origin: string = getHost()): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	const sqlUrl = `${origin}/api/select?nnumber=${nnumber.toUpperCase()}`;
	const webUrl = `${origin}/api/scrape?nnumber=${nnumber.toUpperCase()}`;
	return {
		sql: ajaxGet(sqlUrl, isScraperArray),
		web: ajaxGet(webUrl, isScraperArray),
	};
};

export const ajaxFullName = (fname: string, lname: string, origin: string = getHost()): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	const sqlUrl = `${origin}/api/select?fname=${fname}&lname=${lname}`;
	const webUrl = `${origin}/api/scrape?fname=${fname}&lname=${lname}`;
	return {
		sql: ajaxGet(sqlUrl, isScraperArray),
		web: ajaxGet(webUrl, isScraperArray),
	};
};

export const ajaxLastName = (lname: string, origin: string = getHost()): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	const sqlUrl = `${origin}/api/select?lname=${lname}`;
	const webUrl = `${origin}/api/scrape?lname=${lname}`;
	return {
		sql: ajaxGet(sqlUrl, isScraperArray),
		web: ajaxGet(webUrl, isScraperArray),
	};
};

export const ajaxFirstName = (fname: string, origin: string = getHost()): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	const sqlUrl = `${origin}/api/select?fname=${fname}`;
	const webUrl = `${origin}/api/scrape?fname=${fname}`;
	return {
		sql: ajaxGet(sqlUrl, isScraperArray),
		web: ajaxGet(webUrl, isScraperArray),
	};
};

export const ajaxName = ({ fname = "", lname = "" }, origin: string = getHost()): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	if (fname === "" && lname === "") {
		return { sql: Promise.resolve([]), web: Promise.resolve([]) };
	}
	else if (fname !== "" && lname !== "") {
		return ajaxFullName(fname, lname, origin);
	}
	else if (fname !== "") {
		return ajaxFirstName(fname, origin);
	}
	else {
		return ajaxLastName(lname, origin);
	}
};
