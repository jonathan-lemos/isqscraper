import deepEqual from "deep-equal";

export function equivalent<T>(a: T[], b: T[]): boolean {
	a = dedupe(a);
	b = dedupe(b);

	const x = new Set<number>();
	if (a.length !== b.length) {
		return false;
	}
	for (const n of a) {
		for (let j = 0; j < b.length; ++j) {
			if (x.has(j)) {
				continue;
			}
			if (deepEqual(n, b[j])) {
				x.add(j);
			}
		}
	}
	return x.size === a.length;
}

export function dedupe<T>(arr: T[]): T[] {
	let output: T[] = [];
	for (let i = 0; i < arr.length; ++i) {
		let j;
		for (j = i + 1; j < arr.length; ++j) {
			if (deepEqual(arr[i], arr[j])) {
				break;
			}
		}
		if (j === arr.length) {
			output = output.concat(arr[i]);
		}
	}
	return output;
}

export function intersection<T>(...arg: T[][]): T[] {
	if (arg.length === 0) {
		return [];
	}
	const q =  dedupe(arg[0]).filter(e => {
		for (let i = 1; i < arg.length; ++i) {
			let found = false;
			for (const f of arg[i]) {
				if (deepEqual(e, f)) {
					found = true;
					break;
				}
			}
			if (!found) {
				return false;
			}
			return true;
		}
	});
	return q;
}

export function union<T>(...arg: T[][]): T[] {
	return arg.reduce((a, k) => a.concat(dedupe(k)), []);
}

export function diff<T>(a: T[], b: T[]): { a: T[], b: T[] } {
	a = dedupe(a);
	b = dedupe(b);
	const aret = a.filter(elem => {
		for (const c of b) {
			if (deepEqual(elem, c)) {
				return false;
			}
		}
		return true;
	});
	const bret = b.filter(elem => {
		for (const c of a) {
			if (deepEqual(elem, c)) {
				return false;
			}
		}
		return true;
	});
	return {a: aret, b: bret}
}
