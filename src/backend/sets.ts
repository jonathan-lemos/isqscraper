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
	const freq = new Map<T, number>();
	arg.forEach(x => dedupe(x).forEach(y => {
		if (freq.get(y) === undefined) {
			freq.set(y, 1);
		}
		else {
			freq.set(y, freq.get(y) as number + 1);
		}
	}));
	return [...freq].reduce((a, k) => {
		if (k[1] === arg.length) {
			return a.concat(k[0]);
		}
		return a;
	}, [] as T[]);
}

export function union<T>(...arg: T[][]): T[] {
	return arg.reduce((a, k) => a.concat(dedupe(k)), []);
}

export function diff<T>(a: T[], b: T[]): {a: T[], b: T[]} {
	const sa = new Set<T>(a);
	const sb = new Set<T>(b);
	return {
		a: a.filter(x => !sb.has(x)),
		b: b.filter(x => !sa.has(x)),
	};
}
