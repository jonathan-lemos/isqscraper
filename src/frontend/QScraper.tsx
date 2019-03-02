import React from "react";
import { dedupe } from "../backend/sets";
import { ScraperEntry } from "../backend/SqlServer";
import { ajaxCourseCode, ajaxName, updateSql } from "./ajax";
import { QTable } from "./QTable";

const QScraperTableTitles = Object.freeze([
	"Course Code",
	"CRN",
	"ISQ",
	"Professor",
	"Term",
	"Year",
]);

const makeQScraperTableEntry = (s: ScraperEntry): ReadonlyArray<string> => Object.freeze([
	s.coursecode,
	s.crn.toString(),
	s.isq.toString(),
	s.lname,
	s.term,
	s.year.toString(),
]);

const getPromises = (query: string): Array<Promise<ScraperEntry[]>> => {
	if (/[A-Z]{3}\d{4}/.test(query.toUpperCase())) {
		const s = query.toUpperCase();
		const q = ajaxCourseCode(s);
		return [q.sql, q.web];
	}
	if (query.split(/\s+/).length === 2) {
		const a = query.split(/\s+/);
		const b = ajaxName({ fname: a[0], lname: a[1] });
		return [b.sql, b.web];
	}
	else {
		const a = ajaxName({ fname: query });
		const b = ajaxName({ lname: query });
		return [a.sql, a.web, b.sql, b.web];
	}
};

export interface QScraperProps {
	sqlHost: string;
	sqlPassword: string;
	sqlPort: number;
	sqlUser: string;
}

export interface QScraperState {
	currentEntries: ScraperEntry[];
	currentQuery: string;
}

export default class QScraper extends React.Component<QScraperProps, QScraperState> {
	public static defaultProps = {
		sqlPort: 3306,
	};

	constructor(props: QScraperProps) {
		super(props);
		this.state = { currentEntries: [], currentQuery: "" };
		this.onInputChange = this.onInputChange.bind(this);
		this.updateTable = this.updateTable.bind(this);
	}

	public render() {
		return (
			<div className="w-100 px-2 d-flex flex-column align-items-center">
				<form className="form-inline my-2 w-75">
					<input
						className="form-control flex-grow-1 text-center"
						type="search"
						placeholder="Type a course code"
						onChange={this.onInputChange} />
				</form>
				<QTable
					entries={this.state.currentEntries.map(e => makeQScraperTableEntry(e))}
					titles={QScraperTableTitles} />
			</div>
		);
	}

	private onInputChange(s: React.ChangeEvent<HTMLInputElement>): void {
		this.setState({ currentQuery: s.target.value }, this.updateTable);
	}

	private async updateTable(): Promise<void> {
		let arr: ScraperEntry[] = [];
		const p = getPromises(this.state.currentQuery);
		p.forEach(x => x.then(y => {
			arr = dedupe(arr.concat(y));
			this.setState({ currentEntries: arr });
		}).catch(e => console.log(e)));
	}
}
