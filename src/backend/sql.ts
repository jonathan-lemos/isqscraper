import mysql from "mysql";

/*
isqscraper entry:
----------------------------------------
|coursecode|crn|isq|professor|term|year|
----------------------------------------
*/

export interface ScraperEntry {
	coursecode: string;
	crn: number;
	isq: number;
	professor: string;
	term: string;
	year: number;
}

const ISQSCRAPER_ENTRIES_DB = "isqscraper";
const ISQSCRAPER_ENTRIES_TABLE = "isqscraper_entries";

export default class SqlServer {
	public static async create(host: string, user: string, password: string, port: number = 3306): Promise<SqlServer> {
		return new Promise<SqlServer>((resolve, reject) => {
			const con1 = mysql.createConnection({
				host,
				password,
				port,
				user,
			});

			const con2 = mysql.createConnection({
				database: ISQSCRAPER_ENTRIES_DB,
				host,
				password,
				port,
				user,
			});

			const iConnect = (): Promise<void> => new Promise<void>((res, rej) => {
				con1.connect(err => {
					if (err) {
						rej(err.message);
						return;
					}
					res();
					return;
				});
			});

			const iCreateDb = (): Promise<void> => new Promise<void>((res, rej) => {
				con1.query(`CREATE DATABASE IF NOT EXISTS ${ISQSCRAPER_ENTRIES_DB}`, err => {
					if (err) {
						rej(err.message);
						return;
					}
					res();
					return;
				});
			});

			const iReconnect = (): Promise<void> => new Promise<void>((res, rej) => {
				con2.connect(err => {
					if (err) {
						rej(err.message);
						return;
					}
					res();
					return;
				});
			});

			const iCreateTable = (): Promise<void> => new Promise<void>((res, rej) => {
				const sql = mysql.escape(`CREATE TABLE IF NOT EXISTS ${ISQSCRAPER_ENTRIES_TABLE} ` +
				"(coursecode CHAR(16), crn INT, isq DECIMAL(3,2), professor VARCHAR(255), term CHAR(16), year INT)");
				con2.query(sql, err => {
					if (err) {
						rej(err.message);
						return;
					}
					res();
					return;
				});
			});

			try {
				await iConnect();
				await iCreateDb();
				con1.end();
				await iReconnect();
				await iCreateTable();
			}
			catch (e) {
				reject(e);
				return;
			}

			resolve(new SqlServer(con2));
			return;
		});
	}

	private con: mysql.Connection;

	private constructor(con: mysql.Connection) {
		this.con = con;
	}

	public end() {
		this.con.end();
	}

	public async insert(par: ScraperEntry | ScraperEntry[]): Promise<void> {
		const isNotArray = (o: ScraperEntry | ScraperEntry[]): o is ScraperEntry => {
			return Object.keys(o).includes("coursecode");
		};

		let arr: ScraperEntry[];
		if (isNotArray(par)) {
			arr = [par];
		}
		else {
			arr = par;
		}
		return new Promise<void>((resolve, reject) => {
			const sql = mysql.escape(`INSERT INTO ${ISQSCRAPER_ENTRIES_TABLE} VALUES ?`);
			const values = arr.map(s => [s.coursecode, s.crn, s.isq, s.professor, s.term, s.year]);
			this.con.query(sql, [values], err => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve();
				return;
			});
		});
	}

	public async delete(par: ScraperEntry | ScraperEntry[]): Promise<void> {
		const isNotArray = (o: ScraperEntry | ScraperEntry[]): o is ScraperEntry => {
			return Object.keys(o).includes("coursecode");
		};

		let arr: ScraperEntry[];
		if (isNotArray(par)) {
			arr = [par];
		}
		else {
			arr = par;
		}
		return new Promise<void>((resolve, reject) => {
			arr.forEach(e => {
				const sql = mysql.escape(`DELETE FROM ${ISQSCRAPER_ENTRIES_TABLE} ` +
					"WHERE coursecode=? AND crn=? AND isq=? AND professor=? AND term=? AND YEAR=?");
				const values = arr.map(s => [s.coursecode, s.crn, s.isq, s.professor, s.term, s.year]);
				this.con.query(sql, [e.coursecode, e.crn, e.isq, e.professor, e.term, e.year], err => {
					if (err) {
						reject(err.message);
						return;
					}
					resolve();
					return;
				});
			});
		});
	}

	public async getByCourseCode(coursecode: string): Promise<ScraperEntry[]> {
		return new Promise<ScraperEntry[]>((resolve, reject) => {
			const sql = mysql.escape(`SELECT * FROM ${ISQSCRAPER_ENTRIES_TABLE} WHERE coursecode=?`);
			const value = coursecode;
			this.con.query(sql, [value], (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result);
				return;
			});
		});
	}

	public async getByProfessor(professor: string): Promise<ScraperEntry[]> {
		return new Promise<ScraperEntry[]>((resolve, reject) => {
			const sql = mysql.escape(`SELECT * FROM ${ISQSCRAPER_ENTRIES_TABLE} WHERE professor=?`);
			const value = professor;
			this.con.query(sql, [value], (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result);
				return;
			});
		});
	}

	public async getCourseCodes(): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			const sql = mysql.escape(`SELECT coursecode FROM ${ISQSCRAPER_ENTRIES_TABLE}`);
			this.con.query(sql, (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result.map((s: { coursecode: string }) => s.coursecode));
				return;
			});
		});
	}

	public async getProfessors(): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			const sql = mysql.escape(`SELECT professor FROM ${ISQSCRAPER_ENTRIES_TABLE}`;
			this.con.query(sql, (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result.map((s: { professor: string }) => s.professor));
				return;
			});
		});
	}
}
