import React from "react";
import QScraper from "./QScraper";

export type ActiveType = "Home";

export const navbarEntries = [
	{href: "/", id: "Home" as ActiveType, title: "Home"},
];
export interface QAppProps {
	active: ActiveType;
	brand: string;
	href: string;
	sqlHost: string;
	sqlPassword: string;
	sqlPort: number;
	sqlUser: string;
}

export interface QAppState {
	active: ActiveType;
}
export default class QApp extends React.Component<QAppProps, QAppState> {
	public static defaultProps: QAppProps = {
		active: "Home",
		brand: "ISQ Scraper",
		href: "#",
		sqlHost: "localhost",
		sqlPassword: "",
		sqlPort: 3306,
		sqlUser: "root",
	};

	constructor(props: QAppProps) {
		super(props);
		this.state = {active: "Home"};
	}

	public render() {
		return (
				<QScraper
					active={this.state.active}
					brand={this.props.brand}
					entries={navbarEntries}
					sqlHost={this.props.sqlHost}
					sqlPassword={this.props.sqlPassword}
					sqlPort={this.props.sqlPort}
					sqlUser={this.props.sqlUser}/>
		);
	}
}
