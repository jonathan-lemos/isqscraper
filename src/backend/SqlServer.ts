import mysql from "mysql";

import { isProfessorEntry, isScraperEntry, ProfessorEntry, ScraperEntry } from "../dbentries";

const ISQSCRAPER_ENTRIES_TABLE = "entries";
const ISQSCRAPER_PROF_TABLE = "profs";

/**
 * Interface for creating a SQL connection:
 *
 * @param host     The host to connect to. By default this is "localhost"
 * @param password The password of the user account to connect to.
 * @param premade  If set to true, the database and tables are premade and don't need to be created.
 *                 This allows you to restrict the permissions of the isqscraper SQL account.
 *                 By default this is false.
 * @param port     The port to connect to. By default this is 3306.
 * @param user     The user to log into. By default this is "root".
 */

/**
 * Class for interfacing with the backend MySQL server.
 *
 * Database: ${ISQSCRAPER_DB}
 *     Tables: -------------------------------------
 *             |    ${ISQSCRAPER_ENTRIES_TABLE}    |
 *             -------------------------------------
 *             | coursecode CHAR(16)     NOT NULL, |
 *             | crn        INT          NOT NULL, |
 *             | isq        DECIMAL(3,2) NOT NULL, |
 *             | lname      VARCHAR(255) NOT NULL, |
 *             | term       CHAR(16)     NOT NULL, |
 *             | year       INT          NOT NULL, |
 *             | PRIMARY KEY (crn, term, year),    |
 *             | FOREIGN KEY (lname) REFERENCES ${ISQSCRAPER_PROF_TABLE} (lname)
 *             -------------------------------------
 *             |     ${ISQSCRAPER_PROF_TABLE}      |
 *             -------------------------------------
 *             | fname      VARCHAR(255) NOT NULL, |
 *             | lname      VARCHAR(255) NOT NULL, |
 *             | nnumber    CHAR(16)     NOT NULL, |
 *             | PRIMARY KEY (lname, nnumber)      |
 *             -------------------------------------
 */
export default class SqlServer {
	/**
	 * Creates an SqlServer instance.
	 * This is the only way to initialize an SqlServer.
	 * @param host     The host to connect to. By default this is "localhost"
	 * @param password The password of the user account to connect to.
	 * @param premade  If set to true, the database and tables are premade and don't need to be created.
	 *                 In this case it is up to you to create the appropriate data
	 *                 This allows you to restrict the permissions of the isqscraper SQL account.
	 *                 By default this is false.
	 * @param port     The port to connect to. By default this is 3306.
	 * @param user     The user to log into. By default this is "root".
	 *                 If "premade" is true, the SELECT, INSERT, UPDATE, and DELETE permissions are needed.
	 *                 If "premade" is false, the CREATE TABLE, CREATE DATABASE and DROP DATABASE permissions are also needed.
	 *
	 * @return A Promise that will contain a new SqlServer or an error (string) detailing what happened.
	 */
	public static async create({ database = "isqscraper", host = "localhost", password = "", premade = false, port = 3306, user = "root" }): Promise<SqlServer> {
		return new Promise<SqlServer>(async (resolve, reject) => {
			// connection without database (in case the db does not exist yet)
			const con1 = mysql.createConnection({
				host,
				password,
				port,
				user,
			});

			// connection with database
			const con2 = mysql.createConnection({
				database,
				host,
				password,
				port,
				user,
			});

			// connects to the sql server to no database
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

			// creates the database if it doesn't exist
			const iCreateDb = (): Promise<void> => new Promise<void>((res, rej) => {
				con1.query(`CREATE DATABASE IF NOT EXISTS ${database};`, err => {
					if (err) {
						rej(err.message);
						return;
					}
					res();
					return;
				});
			});

			// connects to the newly made database
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

			// creates the tables
			const iCreateTable = (): Promise<void> => new Promise<void>((res, rej) => {
				const sql =
					`CREATE TABLE IF NOT EXISTS ${ISQSCRAPER_PROF_TABLE} (` +
					"fname VARCHAR(255) NOT NULL," +
					"lname VARCHAR(255) NOT NULL," +
					"nnumber CHAR(16) NOT NULL," +
					"PRIMARY KEY (lname, nnumber)" +
					");";
				const sql2 = `CREATE TABLE IF NOT EXISTS ${ISQSCRAPER_ENTRIES_TABLE} (` +
					"coursecode CHAR(16) NOT NULL," +
					"crn INT NOT NULL," +
					"isq DECIMAL(3,2) NOT NULL," +
					"lname VARCHAR(255) NOT NULL," +
					"term ENUM('Spring', 'Summer', 'Fall') NOT NULL," +
					"year INT NOT NULL," +
					"PRIMARY KEY (crn, term, year)," +
					`FOREIGN KEY (lname) REFERENCES ${ISQSCRAPER_PROF_TABLE} (lname)` +
					");";
				con2.query(sql, err => {
					if (err) {
						rej(err.message);
						return;
					}
				});
				con2.query(sql2, err => {
					if (err) {
						rej(err.message);
						return;
					}
					res();
					return;
				});
			});

			try {
				if (!premade) {
					await iConnect();
					await iCreateDb();
					con1.end();
				}
				await iReconnect();
				if (!premade) {
					await iCreateTable();
				}
			}
			catch (e) {
				reject(e);
				return;
			}

			resolve(new SqlServer(con2, database));
			return;
		});
	}

	private con: mysql.Connection;
	private dbName: string;

	private constructor(con: mysql.Connection, dbName: string) {
		this.con = con;
		this.dbName = dbName;
	}

	/**
	 * Gets all the entries in the entry table.
	 */
	public async allEntries(): Promise<ScraperEntry[]> {
		return new Promise<ScraperEntry[]>((resolve, reject) => {
			const sql = `SELECT * FROM ${ISQSCRAPER_ENTRIES_TABLE} ` +
			"ORDER BY year DESC, term DESC;";
			this.con.query(sql, (err, results) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(results);
				return;
			});
		});
	}

	/**
	 * Gets the lname first names in the professor table.
	 */
	public async allFirstNames(): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			const sql = `SELECT DISTINCT fname FROM ${ISQSCRAPER_PROF_TABLE}`;
			this.con.query(sql, (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result.map((s: { fname: string }) => s.fname));
			});
		});
	}

	/**
	 * Gets the lname last names in the professor table.
	 */
	public async allLastNames(): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			const sql = `SELECT DISTINCT lname FROM ${ISQSCRAPER_PROF_TABLE};`;
			this.con.query(sql, (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result.map((s: { lname: string }) => s.lname));
				return;
			});
		});
	}

	/**
	 * Gets the full names in the professor table.
	 */
	public async allNames(): Promise<Array<{fname: string, lname: string}>> {
		return new Promise<Array<{fname: string, lname: string}>>((resolve, reject) => {
			const sql = `SELECT DISTINCT fname, lname FROM ${ISQSCRAPER_PROF_TABLE};`;
			this.con.query(sql, (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result as Array<{fname: string, lname: string}>);
			});
		});
	}

	public async allNNumbers(): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			const sql = `SELECT DISTINCT nnumber FROM ${ISQSCRAPER_PROF_TABLE};`;
			this.con.query(sql, (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result.map((s: { lname: string }) => s.lname));
				return;
			});
		});
	}

	/**
	 * Gets all lnames in the lname table.
	 */
	public async allProfessors(): Promise<ProfessorEntry[]> {
		return new Promise<ProfessorEntry[]>((resolve, reject) => {
			const sql = `SELECT * FROM ${ISQSCRAPER_PROF_TABLE}`;
			this.con.query(sql, (err, results) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(results);
				return;
			});
		});
	}

	/**
	 * Gets the course codes currently present in the entries table.
	 */
	public async allQueriedCourseCodes(): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			const sql = `SELECT DISTINCT coursecode FROM ${ISQSCRAPER_ENTRIES_TABLE};`;
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

	/**
	 * Gets all queried names currently present in the entries table.
	 */
	public async allQueriedNames(): Promise<Array<{fname: string, lname: string}>> {
		return new Promise<Array<{fname: string, lname: string}>>((resolve, reject) => {
			const sql = `SELECT DISTINCT ${ISQSCRAPER_PROF_TABLE}.fname, ${ISQSCRAPER_ENTRIES_TABLE}.lname ` +
			`FROM ${ISQSCRAPER_ENTRIES_TABLE} ` +
			`INNER JOIN ${ISQSCRAPER_PROF_TABLE} ` +
			`ON ${ISQSCRAPER_ENTRIES_TABLE}.lname=${ISQSCRAPER_PROF_TABLE}.lname`;
			this.con.query(sql, (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result);
				return;
			});
		});
	}

	/**
	 * Deletes entries from the database.
	 * @param par An entry or array of entries that should be deleted.
	 */
	public async delete(par: ScraperEntry | ScraperEntry[] | ProfessorEntry | ProfessorEntry[]): Promise<void> {
		if (Array.isArray(par)) {
			const isScraperArray = (arr: ScraperEntry[] | ProfessorEntry[]): arr is ScraperEntry[] => {
				return arr.length === 0 || isScraperEntry(arr[0]);
			};
			if (isScraperArray(par)) {
				await this.deleteEntries(par);
			}
			else {
				await this.deleteProfessors(par);
			}
		}
		else if (isScraperEntry(par)) {
			await this.deleteEntries([par]);
		}
		else {
			await this.deleteProfessors([par]);
		}
	}

	/**
	 * Ends the connection to the SQL server.
	 */
	public async end(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.con.end(err => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve();
				return;
			});
		});
	}

	/**
	 * Returns the last name(s) corresponding to a given first name
	 * @param fname The first name
	 */
	public async fnameToLname(fname: string): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			const sql = `SELECT lname FROM ${ISQSCRAPER_PROF_TABLE} WHERE fname=?`;
			this.con.query(sql, [fname], (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result.map((x: { lname: string }) => x.lname));
			});
		});
	}

	/**
	 * Returns the n-number associated with a professor's first name.
	 * @param fname The last name of the professor to search for.
	 */
	public async fnameToNNumber(fname: string): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			const sql = `SELECT nnumber FROM ${ISQSCRAPER_PROF_TABLE} WHERE fname=?`;
			this.con.query(sql, [fname], (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result.map((x: { nnumber: string }) => x.nnumber));
				return;
			});
		});
	}

	/**
	 * Returns the entries that match a given course code.
	 * @param coursecode The course code to match
	 */
	public async getByCourseCode(coursecode: string): Promise<ScraperEntry[]> {
		return new Promise<ScraperEntry[]>((resolve, reject) => {
			const sql = `SELECT * FROM ${ISQSCRAPER_ENTRIES_TABLE} WHERE coursecode=?;`;
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

	/**
	 * Gets the scraper entries that match a given professor's first name
	 */
	public async getByFirstName(fname: string): Promise<ScraperEntry[]> {
		return new Promise<ScraperEntry[]>((resolve, reject) => {
			const sql = `SELECT ${ISQSCRAPER_ENTRIES_TABLE}.* ` +
			`FROM ${ISQSCRAPER_ENTRIES_TABLE}, ${ISQSCRAPER_PROF_TABLE} ` +
			`WHERE ${ISQSCRAPER_ENTRIES_TABLE}.lname=${ISQSCRAPER_PROF_TABLE}.lname AND ` +
			`${ISQSCRAPER_PROF_TABLE}.fname=?;`;
			this.con.query(sql, [fname], (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result);
				return;
			});
		});
	}

	/**
	 * Gets the scraper entries that match a professor's last name
	 * @param lname The last name
	 */
	public async getByLastName(lname: string): Promise<ScraperEntry[]> {
		return new Promise<ScraperEntry[]>((resolve, reject) => {
			const sql = `SELECT * FROM ${ISQSCRAPER_ENTRIES_TABLE} WHERE lname=?;`;
			this.con.query(sql, [lname], (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result);
				return;
			});
		});
	}

	/**
	 * Returns the entries that match a given name
	 * @param fname The first name
	 * @param lname The last name
	 */
	public async getByName(fname: string, lname: string): Promise<ScraperEntry[]> {
		return new Promise<ScraperEntry[]>((resolve, reject) => {
			const sql = `SELECT ${ISQSCRAPER_ENTRIES_TABLE}.* ` +
			`FROM ${ISQSCRAPER_ENTRIES_TABLE}, ${ISQSCRAPER_PROF_TABLE} ` +
			`WHERE ${ISQSCRAPER_PROF_TABLE}.fname=? AND ` +
			`${ISQSCRAPER_ENTRIES_TABLE}.lname=${ISQSCRAPER_PROF_TABLE}.lname AND ` +
			`${ISQSCRAPER_ENTRIES_TABLE}.lname=?`;
			this.con.query(sql, [fname, lname], (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result);
				return;
			});
		});
	}

	/**
	 * Returns the entries that match a given name
	 * @param nnumber The first name
	 */
	public async getByNNumber(nnumber: string): Promise<ScraperEntry[]> {
		return new Promise<ScraperEntry[]>((resolve, reject) => {
			const sql = `SELECT ${ISQSCRAPER_ENTRIES_TABLE}.* ` +
			`FROM ${ISQSCRAPER_ENTRIES_TABLE}, ${ISQSCRAPER_PROF_TABLE} ` +
			`WHERE ${ISQSCRAPER_PROF_TABLE}.nnumber=? AND ` +
			`${ISQSCRAPER_ENTRIES_TABLE}.lname=${ISQSCRAPER_PROF_TABLE}.lname;`;
			this.con.query(sql, [nnumber.toUpperCase()], (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result);
				return;
			});
		});
	}

	/**
	 * Inserts entries into the entries table.
	 * WARNING: This will silently fail if a lname's last name is not present in the profs table.
	 * @param par An entry or array of entries that should be inserted.
	 */
	public async insert(par: ScraperEntry | ScraperEntry[] | ProfessorEntry | ProfessorEntry[]): Promise<void> {
		if (Array.isArray(par)) {
			const isScraperArray = (arr: ScraperEntry[] | ProfessorEntry[]): arr is ScraperEntry[] => {
				return arr.length === 0 || isScraperEntry(arr[0]);
			};
			if (isScraperArray(par)) {
				await this.insertEntries(par);
			}
			else {
				await this.insertProfessors(par);
			}
		}
		else if (isScraperEntry(par)) {
			await this.insertEntries([par]);
		}
		else {
			await this.insertProfessors([par]);
		}
	}

	/**
	 * Reads professors from a csv file
	 * @param csv The csv split by newline
	 */
	public async insertProfessorsFromCsv(csv: string[]): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			if (csv.length < 1) {
				reject("csv must have at least two lines");
				return;
			}
			const titles = csv[0].split(/\s*,\s*/);
			if (titles.length !== 3 ||
				titles[0] !== "nnumber" ||
				titles[1] !== "fname" ||
				titles[2] !== "lname") {
				reject(`First line of csv must be "nnumber,fname,lname"`);
				return;
			}

			const arr = csv.slice(1).filter(s => s.trim() !== "").map((s, i) => {
				const q = s.split(/\s*,\s*/);
				if (q.length !== 3) {
					reject(`Each line of the csv must have 3 entries (found ${q.length})`);
					return {nnumber: "", fname: "", lname: ""};
				}
				return {nnumber: q[0], fname: q[1], lname: q[2]};
			});

			for (const s of arr) {
				if (s.nnumber === "") {
					reject(`Each line of the csv must have 3 entries`);
					return;
				}
			}

			try {
				await this.insert(arr);
				resolve();
				return;
			}
			catch (e) {
				reject(e.message);
				return;
			}
		});
	}

	/**
	 * Gets the first name(s) of a given last name
	 * @param lname The last name
	 */
	public async lnameToFname(lname: string): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			const sql = `SELECT fname FROM ${ISQSCRAPER_PROF_TABLE} WHERE lname=?`;
			this.con.query(sql, [lname], (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result.map((x: { fname: string }) => x.fname));
				return;
			});
		});
	}

	/**
	 * Returns the n-number associated with a professor's last name.
	 * @param lname The last name of the professor to search for.
	 */
	public async lnameToNNumber(lname: string): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			const sql = `SELECT nnumber FROM ${ISQSCRAPER_PROF_TABLE} WHERE lname=?`;
			this.con.query(sql, [lname], (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result.map((x: { nnumber: string }) => x.nnumber));
				return;
			});
		});
	}

	/**
	 * Returns the n-number associated with a professor's last name.
	 * @param fname The first name of the professor to search for.
	 * @param lname The last name of the professor to search for.
	 */
	public async nameToNNumber(fname: string, lname: string): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			const sql = `SELECT nnumber FROM ${ISQSCRAPER_PROF_TABLE} WHERE fname=? AND lname=?`;
			this.con.query(sql, [fname, lname], (err, result) => {
				if (err) {
					reject(err.message);
					return;
				}
				resolve(result.map((x: { nnumber: string }) => x.nnumber));
				return;
			});
		});
	}

	/**
	 * Deletes all data associated with isqscraper and logs out.
	 */
	public async nuke(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const sql = `DROP DATABASE ${this.dbName}`;
			this.con.query(sql, err => {
				if (err) {
					reject(err);
					return;
				}
			});
			this.con.end(err => {
				if (err) {
					reject(err);
					return;
				}
			});
			resolve();
			return;
		});
	}

	private async deleteEntries(arr: ScraperEntry[]) {
		return new Promise<void>((resolve, reject) => {
			arr.forEach(e => {
				const sql = `DELETE FROM ${ISQSCRAPER_ENTRIES_TABLE} ` +
					"WHERE coursecode=? AND crn=? AND isq=? AND lname=? AND term=? AND YEAR=?;";
				this.con.query(sql, [e.coursecode, e.crn, e.isq, e.lname, e.term, e.year], err => {
					if (err) {
						reject(err.message);
						return;
					}
				});
			});
			resolve();
		});
	}

	private async deleteProfessors(arr: ProfessorEntry[]) {
		return new Promise<void>((resolve, reject) => {
			arr.forEach(e => {
				const sql = `DELETE FROM ${ISQSCRAPER_PROF_TABLE} ` +
					"WHERE fname=? AND lname=? AND nnumber=?;";
				this.con.query(sql, [e.fname, e.lname, e.nnumber], (err, results) => {
					if (err) {
						reject(err.message);
						return;
					}
				});
			});
			resolve();
		});
	}

	private async insertEntries(arr: ScraperEntry[]): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const sql = `INSERT IGNORE INTO ${ISQSCRAPER_ENTRIES_TABLE} VALUES ?;`;
			const values = arr.map(s => [s.coursecode, s.crn, s.isq, s.lname, s.term, s.year]);
			this.con.query(sql, [values], (err, results) => {
				if (err) {
					reject(err.message);
					return;
				}
			});
			resolve();
		});
	}

	private async insertProfessors(arr: ProfessorEntry[]): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const sql = `INSERT IGNORE INTO ${ISQSCRAPER_PROF_TABLE} VALUES ?;`;
			const values = arr.map(s => [s.fname, s.lname, s.nnumber]);
			this.con.query(sql, [values], (err, results) => {
				if (err) {
					reject(err.message);
					return;
				}
			});
			resolve();
		});
	}
}
