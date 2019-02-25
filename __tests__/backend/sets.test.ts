import * as sets from "../../src/backend/sets";

describe("sets tests", () => {
	const s1 = [
		{a: "a", b: "b", c: 4, d: { a: 5, b: 6} },
		{a: "a", b: "x", c: 4, d: { a: 5, b: 6} },
		{a: "a", b: "b", c: 4, d: { a: 5, b: 7} },
	];
	const s2 = [
		{a: "a", b: "b", c: 4, d: { a: 5, b: 6} },
		{a: "a", b: "y", c: 4, d: { a: 5, b: 6} },
		{a: "a", b: "c", c: 4, d: { a: 5, b: 6} },
		{a: "a", b: "c", c: 4, d: { a: 5, b: 6} },
		{a: "a", b: "b", c: 4, d: { a: 5, b: 7} },
	];

	it("dedupes arrays", () => {
		const test1 = [
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "x", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "x", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 7 } },
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 6 } },
		];
		const eq1 = [
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "x", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 7 } },
		];
		const q = sets.dedupe(test1);
		expect(sets.equivalent(sets.dedupe(test1), eq1)).toEqual(true);
	});

	it("checks if two arrays have the same elements", () => {
		const eq1 = [
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 7 } },
		];
		const eq2 = [
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 7 } },
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 6 } },
		];
		const eq3 = [
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 7 } },
		];
		const neq1 = [
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "c", c: 4, d: { a: 5, b: 7 } },
		];
		const neq2 = [
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "c", c: 4, d: { a: 5, b: 8 } },
		];

		expect(sets.equivalent(eq1, eq2)).toEqual(true);
		expect(sets.equivalent(eq1, eq3)).toEqual(true);
		expect(sets.equivalent(eq1, neq1)).toEqual(false);
		expect(sets.equivalent(eq1, neq2)).toEqual(false);
	});

	it("gets the intersect of two arrays", () => {
		const exp = [
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 7 } },
		];
		expect(sets.equivalent(sets.intersection(s1, s2), exp)).toEqual(true);
	});

	it("gets the union of two arrays", () => {
		const exp = [
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "x", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "b", c: 4, d: { a: 5, b: 7 } },
			{ a: "a", b: "y", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "c", c: 4, d: { a: 5, b: 6 } },
			{ a: "a", b: "c", c: 4, d: { a: 5, b: 6 } },
		];
		expect(sets.equivalent(sets.union(s1, s2), exp)).toEqual(true);
	});

	it("gets the difference between two arrays", () => {
		const exp = {
			a: [
				{ a: "a", b: "x", c: 4, d: { a: 5, b: 6 } },
			],
			b: [
				{ a: "a", b: "y", c: 4, d: { a: 5, b: 6 } },
				{ a: "a", b: "c", c: 4, d: { a: 5, b: 6 } },
				{ a: "a", b: "c", c: 4, d: { a: 5, b: 6 } },
			],
		};
		const res = sets.diff(s1, s2);
		expect(sets.equivalent(res.a, exp.a)).toEqual(true);
		expect(sets.equivalent(res.b, exp.b)).toEqual(true);
	});

	it("respects logic/handles varargs", () => {
		const res = sets.diff(s1, s2);
		expect(sets.equivalent(
			sets.union(s1, res.a, res.b),
			sets.union(s1, s2),
		)).toEqual(true);
	});
});
