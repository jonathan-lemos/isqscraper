import { dedupe, equivalent } from "../../src/backend/sets";
import SqlServer from "../../src/backend/sql";

const sqlLoginInfo = {
	password: "toor",
	user: "root",
};

describe("SqlServer tests", async () => {
	const profs = [
		{ fname: "redferrari", lname: "sandy", nnumber: "n01234567" },
		{ fname: "faze", lname: "painman", nnumber: "n22222222" },
		{ fname: "ree", lname: "eggman", nnumber: "n00000001" },
	];
	const arr = [
		{ coursecode: "COP3503", crn: 69696, isq: 4.69, lname: "sandy", term: "Summer", year: 2018 },
		{ coursecode: "COP3503", crn: 69697, isq: 3.69, lname: "painman", term: "Spring", year: 2018 },
		{ coursecode: "COP9999", crn: 99999, isq: 2.69, lname: "painman", term: "Spring", year: 2018 },
	];
	const entry = { coursecode: "COP9999", crn: 88888, isq: 5.00, lname: "eggman", term: "Fall", year: 2017 };

	it("inserts entries", async () => {
		const sql = await SqlServer.create(sqlLoginInfo);
		const doThing = async () => {
			sql.insert(profs);
			sql.insert(arr);
			sql.insert(entry);
			sql.insert(entry);
		};

		await doThing();
		const q = await sql.allEntries();
		sql.nuke();
		expect(equivalent(q, arr.concat(entry))).toEqual(true);
	});

	it("deletes entries", async () => {
		const sql = await SqlServer.create(sqlLoginInfo);
		const doThing = async () => {
			sql.insert(profs);
			sql.insert(arr);
			sql.insert(entry);
			sql.insert(entry);
		};
		const deleteThing = async () => {
			sql.delete(arr);
			sql.delete(profs[0]);
		};

		await doThing();
		await deleteThing();
		const q = await sql.allEntries();
		const r = await sql.allProfessors();
		sql.nuke();
		expect(equivalent(q, [entry])).toEqual(true);
		expect(equivalent(r, profs.slice(1))).toEqual(true);
	});

	it("selects all", async () => {
		const sql = await SqlServer.create(sqlLoginInfo);
		const doThing = async () => {
			sql.insert(profs);
			sql.insert(arr);
			sql.insert(entry);
			sql.insert(entry);
		};

		await doThing();
		const a = await sql.allEntries();
		expect(equivalent(a, arr.concat(entry))).toEqual(true);
		const b = await sql.allFirstNames();
		expect(equivalent(b, profs.map(x => x.fname))).toEqual(true);
		const c = await sql.allLastNames();
		expect(equivalent(c, profs.map(x => x.lname)));
		const d = await sql.allNames();
		expect(equivalent(d, profs.map(x => ({fname: x.fname, lname: x.lname})))).toEqual(true);
		const e = await sql.allProfessors();
		expect(equivalent(e, profs)).toEqual(true);
		const f = await sql.allQueriedCourseCodes();
		expect(equivalent(f, dedupe(arr.map(x => x.coursecode))));
		const g = await sql.allQueriedNames();
		expect(equivalent(g, profs.slice(0, -1)));
		sql.nuke();
	});

	it("gets n numbers", async () => {
		const sql = await SqlServer.create(sqlLoginInfo);
		profs.forEach(async x => {
			const res1 = await sql.fnameToNNumber(x.fname);
			const res2 = await sql.lnameToNNumber(x.lname);
			const res3 = await sql.nameToNNumber(x.fname, x.lname);
			expect(res1).toEqual(x.nnumber);
			expect(res2).toEqual(x.nnumber);
			expect(res3).toEqual(x.nnumber);
		});
		expect(await sql.lnameToNNumber("n00001111")).toEqual(null);
	});
});
