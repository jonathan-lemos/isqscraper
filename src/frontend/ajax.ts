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

const ajaxFullName = (fname: string, lname: string): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	return {
		sql: new Promise<ScraperEntry[]>((resolve, reject) => {
			const url = `${document.location.protocol}//${document.location.hostname}/api/getByName`;
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
		}),
		web: new Promise<ScraperEntry[]>((resolve, reject) => {
			const getNno = async (): Promise<string> => new Promise<string>((res, rej) => {
				const urlNno = `${document.location.protocol}//${document.location.hostname}/api/nameToNNumber`;
				$.ajax({
					data: { fname, lname },
					error: err => rej(err),
					success: (result: string[]) => {
						if (!Array.isArray(result)) {
							rej(result);
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
			const url = `${document.location.protocol}//${document.location.hostname}/api/getByLastName`;
			$.ajax({
				data: lname,
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
			const getNno = async (): Promise<string> => new Promise<string>((res, rej) => {
				const urlNno = `${document.location.protocol}//${document.location.hostname}/api/lnameToNNumber`;
				$.ajax({
					data: lname,
					error: err => rej(err),
					success: (result: string[]) => {
						if (!Array.isArray(result)) {
							rej(result);
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

const ajaxFirstName = (fname: string): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	return {
		sql: new Promise<ScraperEntry[]>((resolve, reject) => {
			const url = `${document.location.protocol}//${document.location.hostname}/api/getByFirstName`;
			$.ajax({
				data: fname,
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
			const getNno = async (): Promise<string> => new Promise<string>((res, rej) => {
				const urlNno = `${document.location.protocol}//${document.location.hostname}/api/fnameToNNumber`;
				$.ajax({
					data: fname,
					error: err => rej(err),
					success: (result: string[]) => {
						if (!Array.isArray(result)) {
							rej(result);
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
			const getLname = async (): Promise<string> => new Promise<string>((res, rej) => {
				const urlNno = `${document.location.protocol}//${document.location.hostname}/api/fnameToLname`;
				$.ajax({
					data: fname,
					error: err => rej(err),
					success: (result: string[]) => {
						if (!Array.isArray(result)) {
							rej(result);
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
			return ajaxNNumber(await getNno(), await getLname()).web;
		}),
	};
};

export const ajaxName = ({ fname = "", lname = "" }): { sql: Promise<ScraperEntry[]>, web: Promise<ScraperEntry[]> } => {
	if (fname === "" && lname === "") {
		return { sql: Promise.resolve([]), web: Promise.resolve([]) };
	}
	else if (fname !== "" && lname !== "") {
		return {
			sql: new Promise<ScraperEntry[]>((resolve, reject) => {
				const url = `${document.location.protocol}//${document.location.hostname}/api/getByName`;
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
			}),
			web: new Promise<ScraperEntry[]>((resolve, reject) => {
				const getNno = async (): Promise<string> => new Promise<string>((res, rej) => {
					const urlNno = `${document.location.protocol}//${document.location.hostname}/api/nameToNNumber`;
					$.ajax({
						data: { fname, lname },
						error: err => rej(err),
						success: (result: string[]) => {
							if (!Array.isArray(result)) {
								rej(result);
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
