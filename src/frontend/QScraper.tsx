import $ from "jquery";
import React from "react";
import SqlServer, { ScraperEntry } from "../backend/sql";
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
	s.professor,
	s.term,
	s.year.toString(),
]);

const scrapeCourseCode = async (coursecode: string) => new Promise<ScraperEntry[]>((resolve, reject) => {
	const url = `${document.location.protocol}//${document.location.hostname}/scrape?coursecode=${coursecode}`;
	$.ajax({
		error: err => reject(err),
		success: (result: ScraperEntry[]) => {
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
		this.scrapeQuery = this.scrapeQuery.bind(this);
		this.sqlServer = null;
		this.initSqlServer = this.initSqlServer.bind(this);
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
		this.setState({ currentQuery: s.target.value }, this.scrapeQuery);
	}

	private async scrapeCourseQuery(): Promise<void> {
		let webArr: Set<ScraperEntry>;
		let sqlArr: Set<ScraperEntry>;

		const updateSqlDb = () => {
			const diffAdd = new Set([...webArr].filter(x => !sqlArr.has(x)));
			const diffRem = new Set([...sqlArr].filter(x => !webArr.has(x)));

			if (this.sqlServer === null) {
				return;
			}
			this.sqlServer.insert([...diffAdd]);
			this.sqlServer.delete([...diffRem]);
		};

		try {
			if (this.sqlServer !== null) {
				this.sqlServer.getByCourseCode(this.state.currentQuery).then(val => {
					sqlArr = new Set(val);
					if (!webArr) {
						this.setState({ currentEntries: val.sort((a, b) => b.year - a.year) });
					}
					else {
						updateSqlDb();
					}
				});
			}
			scrapeCourseCode(this.state.currentQuery).then(val => {
				webArr = new Set(val);
				this.setState({ currentEntries: val.sort((a, b) => b.year - a.year) });
				if (sqlArr) {
					updateSqlDb();
				}
			});
		}
		catch (e) {
			return;
		}
	}

	private async scrapeQuery(): Promise<void> {

	}

	private async initSqlServer(): Promise<void> {
		this.sqlServer = await SqlServer.create(
			this.props.sqlUser,
			this.props.sqlPassword,
			this.props.sqlHost,
			this.props.sqlPort,
		);
	}
}
