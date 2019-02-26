import { equivalent } from "../../src/backend/sets";
import SqlServer from "../../src/backend/sql";

describe("SqlServer tests", async () => {
	const profs = [
		{ fname: "redferrari", lname: "sandy", nnumber: "n01234567" },
		{ fname: "faze", lname: "painman", nnumber: "n22222222" },
		{ fname: "ree", lname: "eggman", nnumber: "n00000001" },
	];
	const arr = [
		{ coursecode: "COP3503", crn: 69696, isq: 4.69, professor: "sandy", term: "Summer", year: 2018 },
		{ coursecode: "COP3503", crn: 69697, isq: 1.00, professor: "painman", term: "Spring", year: 2018 },
		{ coursecode: "COP9999", crn: 99999, isq: 2.69, professor: "painman", term: "Spring", year: 2018 },
	];
	const entry = { coursecode: "COP9999", crn: 88888, isq: 5.00, professor: "eggman", term: "Fall", year: 2017 };

	it("inserts entries", async () => {
		const sql = await SqlServer.create({user: "root", password: "toor"});
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
		const sql = await SqlServer.create({user: "root", password: "toor"});
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
});
