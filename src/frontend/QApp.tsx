import React from "react";
import QNavbar from "./QNavbar";
import QScraper from "./QScraper";

export type ActiveType = "Home";

export const navbarEntries = [
	{href: "/", id: "Home" as ActiveType, title: "Home"},
];
export interface QAppProps {
	active: ActiveType;
	brand: string;
	href: string;
}

export interface QAppState {
	active: ActiveType;
}
export default class QApp extends React.Component<QAppProps, QAppState> {
	public static defaultProps: QAppProps = {
		active: "Home",
		brand: "ISQ Scraper",
		href: "#",
	};

	public render() {
		return (
			<div>
				<QNavbar active={this.state.active} brand={this.props.brand} entries={navbarEntries} />
				<QScraper />
			</div>
		);
	}
}
