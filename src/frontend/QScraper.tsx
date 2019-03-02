import React from "react";
import * as sets from "../backend/sets";
import SqlServer, { ScraperEntry } from "../backend/sql";
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

const getPromises = (query: string, con: SqlServer): Array<Promise<ScraperEntry[]>> => {
	if (/[A-Z]{3}\d{4}/.test(query.toUpperCase())) {
		const s = query.toUpperCase();
		return [ajaxCourseCode(s), con.getByCourseCode(s)];
	}
	if (query.split(/\s+/).length === 2) {
		const a = query.split(/\s+/);
		const b = { fname: a[0], lname: a[1] };
		return [ajaxName(b, con), con.getByName(a[0], a[1])];
	}
	else {
		return [
			ajaxName({ fname: query }, con),
			ajaxName({ lname: query }, con),
			con.getByFirstName(query),
			con.getByLastName(query),
		];
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

	private sqlServer: SqlServer | null;

	constructor(props: QScraperProps) {
		super(props);
		this.state = { currentEntries: [], currentQuery: "" };
		this.onInputChange = this.onInputChange.bind(this);
		this.updateTable = this.updateTable.bind(this);
		this.initSqlServer = this.initSqlServer.bind(this);

		this.sqlServer = null;
		this.initSqlServer();
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
		if (this.sqlServer === null) {
			return;
		}
		const p = getPromises(this.state.currentQuery, this.sqlServer);
		let arr: ScraperEntry[] = [];
		p.forEach(async e => {
			arr = arr.concat(await e);
		});
		arr = sets.dedupe(arr);
		this.setState({ currentEntries: arr });
		updateSql(arr, this.sqlServer);
	}

	private async initSqlServer(): Promise<void> {
		this.sqlServer = await SqlServer.create({
			host: this.props.sqlHost,
			password: this.props.sqlPassword,
			port: this.props.sqlPort,
			user: this.props.sqlUser,
		});
	}
}
