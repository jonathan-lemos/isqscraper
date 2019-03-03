import $ from "jquery";
import * as sets from "../backend/sets";
import SqlServer, { ScraperEntry } from "../backend/SqlServer";

const getHost = () => document.location.origin;

export const ajaxCourseCode = (coursecode: string): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => ({
	sql: new Promise<ScraperEntry[]>((resolve, reject) => {
		const url = `${getHost()}/api/allEntries`;
		$.ajax({
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify({ str: coursecode }),
			error: err => reject(new Error(err.toString())),
			success: (result: ScraperEntry[]) => {
				if (!Array.isArray(result)) {
					reject(new Error((result as any).toString()));
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
		const url = `${getHost()}/api/scrape?coursecode=${coursecode}`;
		$.ajax({
			error: err => reject(new Error(err.toString())),
			success: (result: ScraperEntry[]) => {
				if (!Array.isArray(result)) {
					reject(new Error(result as any).toString());
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
		const url = `${getHost()}/api/getByNNumber`;
		$.ajax({
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify({ str: nnumber }),
			error: err =>
			reject(new Error(err.toString())),
			success: (result: ScraperEntry[]) => {
				if (!Array.isArray(result)) {
					reject(new Error((result as any).toString()));
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
		const url = `${getHost()}/api/scrape?nnumber=${nnumber.toUpperCase()}&lname=${lname}`;
		$.ajax({
			error: err =>
			reject(new Error(err.toString())),
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

const ajaxFullName = (fname: string, lname: string): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	return {
		sql: new Promise<ScraperEntry[]>((resolve, reject) => {
			const url = `${getHost()}/api/getByName`;
			$.ajax({
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify({ fname, lname }),
				error: err => reject(new Error(err.toString())),
				success: (result: ScraperEntry[]) => {
					if (!Array.isArray(result)) {
						reject(new Error((result as any).toString()));
						return;
					}
					resolve(result);
					return;
				},
				type: "POST",
				url,
			});
		}),
		web: new Promise<ScraperEntry[]>(async (resolve, reject) => {
			const getNno = async (): Promise<string> => new Promise<string>((res, rej) => {
				const urlNno = `${getHost()}/api/nameToNNumber`;
				$.ajax({
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify({ fname, lname }),
					error: err => rej(new Error(err.toString())),
					success: (result: string[]) => {
						if (!Array.isArray(result)) {
							rej(new Error((result as any).toString()));
							return;
						}
						if (result.length === 0) {
							res("");
						}
						res(result[0]);
						return;
					},
					type: "POST",
					url: urlNno,
				});
			});
			return ajaxNNumber(await getNno(), lname).web;
		}),
	};
};

const ajaxLastName = (lname: string): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	return {
		sql: new Promise<ScraperEntry[]>((resolve, reject) => {
			const url = `${getHost()}/api/getByLastName`;
			$.ajax({
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify({ str: lname }),
				error: err =>
					reject(new Error(err.toString())),
				success: (result: ScraperEntry[]) => {
					if (!Array.isArray(result)) {
						reject(new Error((result as any).toString()));
						return;
					}
					resolve(result);
					return;
				},
				type: "POST",
				url,
			});
		}),
		web: new Promise<ScraperEntry[]>(async (resolve, reject) => {
			const getNno = async (): Promise<string> => new Promise<string>((res, rej) => {
				const urlNno = `${getHost()}/api/lnameToNNumber`;
				$.ajax({
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify({ str: lname }),
					error:
						err => rej(new Error(err.toString())),
					success: (result: string[]) => {
						if (!Array.isArray(result)) {
							rej(new Error((result as any).toString()));
							return;
						}
						if (result.length === 0) {
							rej(new Error(`No N-number found matching last name ${lname}`));
						}
						res(result[0]);
						return;
					},
					type: "POST",
					url: urlNno,
				});
			});
			return ajaxNNumber(await getNno(), lname).web;
		}),
	};
};

const ajaxFirstName = (fname: string): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	return {
		sql: new Promise<ScraperEntry[]>((resolve, reject) => {
			const url = `${getHost()}/api/getByFirstName`;
			$.ajax({
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify({ str: fname }),
				error: err => reject(new Error(err.toString())),
				success: (result: ScraperEntry[]) => {
					if (!Array.isArray(result)) {
						reject(new Error((result as any).toString()));
						return;
					}
					resolve(result);
					return;
				},
				type: "POST",
				url,
			});
		}),
		web: new Promise<ScraperEntry[]>(async (resolve, reject) => {
			const getNno = async (): Promise<string> => new Promise<string>((res, rej) => {
				const urlNno = `${getHost()}/api/fnameToNNumber`;
				$.ajax({
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify({ str: fname }),
					error: err => rej(new Error(err.toString())),
					success: (result: string[]) => {
						if (!Array.isArray(result)) {
							rej(new Error((result as any).toString()));
							return;
						}
						if (result.length === 0) {
							res(`No n-number found matching ${fname}`);
						}
						res(result[0]);
						return;
					},
					type: "POST",
					url: urlNno,
				});
			});
			const getLname = async (): Promise<string> => new Promise<string>((res, rej) => {
				const urlNno = `${getHost()}/api/fnameToLname`;
				$.ajax({
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify({ str: fname }),
					error: err => rej(new Error(err.toString())),
					success: (result: string[]) => {
						if (!Array.isArray(result)) {
							rej(new Error((result as any).toString()));
							return;
						}
						if (result.length === 0) {
							res("");
						}
						res(result[0]);
						return;
					},
					type: "POST",
					url: urlNno,
				});
			});
			resolve(await ajaxNNumber(await getNno(), await getLname()).web);
		}),
	};
};

export const ajaxName = ({ fname = "", lname = "" }): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	if (fname === "" && lname === "") {
		return { sql: Promise.resolve([]), web: Promise.resolve([]) };
	}
	else if (fname !== "" && lname !== "") {
		return ajaxFullName(fname, lname);
	}
	else if (fname !== "") {
		return ajaxFirstName(fname);
	}
	else {
		return ajaxLastName(lname);
	}
};

export const updateSql = async (results: ScraperEntry[], con: SqlServer): Promise<void> => {
	const d = sets.diff(results, await con.allEntries());
	con.insert(d.a);
	con.delete(d.b);
};
