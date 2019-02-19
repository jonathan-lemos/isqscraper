import $ from "jquery";
import React from "react";
import { Container } from "reactstrap";
import { QTable } from "./QTable";

export type QScraperEntryTerm = "Spring" | "Summer" | "Fall";

export interface QScraperEntry {
	coursecode: string;
	crn: number;
	isq: number;
	professor: string;
	term: QScraperEntryTerm;
	year: number;
}

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

const scrapeCourseCode = async (coursecode: string) => new Promise<QScraperEntry[]>((resolve, reject) => {
	const url = `${document.location.protocol}//${document.location.hostname}/scrape?coursecode=${coursecode}`;
	$.ajax({
		error: err => reject(err),
		success: (result: QScraperEntry[]) => {
			if (!Array.isArray(result)) {
				reject(result);
			}
			try {
				resolve(result);
				return;
			}
			catch (e) {
				reject(e);
			}
		},
		url,
	});
});

export interface QScraperState {
	currentEntries: QScraperEntry[];
	currentQuery: string;
}

export default class QScraper extends React.Component<{}, QScraperState> {
	constructor(props: {}) {
		super(props);
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
		this.setState({ currentQuery: s.target.value }, this.scrapeQuery);
	}

	private async scrapeQuery(): Promise<void> {
		try {
			const arr = await scrapeCourseCode(this.state.currentQuery);
			this.setState({ currentEntries: arr });
		}
		catch (e) {
			console.log(e);
			return;
		}
	}
}
