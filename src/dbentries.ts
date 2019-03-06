export interface ScraperEntry {
	coursecode: string;
	crn: number;
	isq: number;
	lname: string;
	term: string;
	year: number;
}

export const isScraperEntry = (s: any): s is ScraperEntry => {
	if (s == null) {
		return false;
	}
	return Object.keys(s).includes("coursecode") &&
	typeof s.coursecode === "string" &&
	Object.keys(s).includes("crn") &&
	typeof s.crn === "number" &&
	Object.keys(s).includes("isq") &&
	typeof s.isq === "number" &&
	Object.keys(s).includes("lname") &&
	typeof s.lname === "string" &&
	Object.keys(s).includes("term") &&
	typeof s.term === "string" &&
	Object.keys(s).includes("year") &&
	typeof s.year === "number";
};

export interface ProfessorEntry {
	fname: string;
	lname: string;
	nnumber: string;
}

export const isProfessorEntry = (s: any): s is ProfessorEntry => {
	if (s == null) {
		return false;
	}
	return Object.keys(s).includes("fname") &&
	typeof s.fname === "string" &&
	Object.keys(s).includes("lname") &&
	typeof s.lname === "string" &&
	Object.keys(s).includes("nnumber") &&
	typeof s.nnumber === "string";
};
