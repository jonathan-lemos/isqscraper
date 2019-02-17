import React from "react";
import { Container } from "reactstrap";
import { QScraperEntry, scrapeCourseCode } from "../backend/scraper";
import { QTable } from "./QTable";

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