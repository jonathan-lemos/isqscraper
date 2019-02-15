import cheerio from "cheerio";
import React from "react";
import { Container } from "reactstrap";
import request from "request";
import { QTable } from "./QTable";

export type QScraperEntryTerm = "Spring" | "Summer" | "Fall";

const QScraperTableTitles = Object.freeze([
	"Course Code",
	"CRN",
	"ISQ",
	"Professor",
	"Term",
	"Year",
]);

const makeQScraperTableEntry = (s: QScraperEntry): ReadonlyArray<string> => Object.freeze([
	s.coursecode,
	s.crn.toString(),
	s.isq.toString(),
	s.professor,
	s.term,
	s.year.toString(),
]);

export interface QScraperEntry {
	coursecode: string;
	crn: number;
	isq: number;
	professor: string;
	term: QScraperEntryTerm;
	year: number;
}

export const scrapeCourseCode = async (coursecode: string) => new Promise<QScraperEntry[]>((resolve, reject) => {
	const url = `https://banner.unf.edu/pls/nfpo/wksfwbs.p_course_isq_grade?pv_course_id=${coursecode}`;
	request(url, {}, (error, response, html) => {
		if (error) {
			reject(error);
			return;
		}
		const $ = cheerio.load(html);
		try {
			const table = Array.prototype.slice.call($("table").get(6).children[0].children).slice(2);
			resolve(table.map(e => {
				return {
					coursecode,
					crn: parseInt(e.children[1].innerText, 10),
					isq: parseFloat(e.children[12].innerText),
					professor: e.children[2].innerText,
					term: e.children[0].innerText.split(/\s+/)[0] as QScraperEntryTerm,
					year: parseInt(e.children[0].innerText.split(/\s+/)[1], 10),
				};
			}));
		}
		catch (e) {
			reject(e);
		}
	});
});

export interface QScraperState {
	currentEntries: QScraperEntry[];
	currentQuery: string;
}

export default class QScraper extends React.Component<{}, QScraperState> {
	constructor() {
		super({});
		this.state = { currentEntries: [], currentQuery: "" };
		this.onInputChange = this.onInputChange.bind(this);
		this.scrapeQuery = this.scrapeQuery.bind(this);
	}

	public render() {
		return (
			<Container>
				<form className="form-inline my-2 my-lg-0 w-75 justify-content-center">
					<input
						className="form-control mr-sm-2 flex-grow-1"
						type="search"
						placeholder="Search"
						onChange={this.onInputChange} />
					<button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
				</form>
				<QTable
					entries={this.state.currentEntries.map(e => makeQScraperTableEntry(e))}
					titles={QScraperTableTitles} />
			</Container>
		);
	}

	private onInputChange(s: React.ChangeEvent<HTMLInputElement>): void {
		this.setState({ currentQuery: s.target.value });
		this.scrapeQuery();
	}

	private async scrapeQuery(): Promise<void> {
		let arr: QScraperEntry[];
		try {
			arr = await scrapeCourseCode(this.state.currentQuery);
		}
		catch (e) {
			console.log(e);
			return;
		}
		this.setState({ currentEntries: arr });
	}
}
