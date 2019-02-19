import React from "react";
import { Navbar } from "reactstrap";
import { ActiveType } from "./QApp";
import { QNavbarButton } from "./QNavbarButton";

export interface QNavbarEntry {
	href: string | null;
	id: ActiveType;
	title: string;
}

export interface QNavbarProps {
	active: ActiveType | null;
	brand: string;
	entries: QNavbarEntry[];
	href: string;
}

export default class QNavbar extends React.Component<QNavbarProps> {
	public static defaultProps = {
		active: null,
		brand: "",
		href: "#",
	};

	public render() {
		return (
			<Navbar className="navbar navbar-expand-md navbar-light bg-light">
				<a className="navbar-brand" href={this.props.href}>{this.props.brand}</a>
				<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
					<span className="navbar-toggler-icon" />
				</button>
				<ul className="navbar-nav mr-auto">
					{this.props.entries.map(e => {
						return <QNavbarButton
							href={e.href === null ? "#" : e.href}
							identifier={e.id}
							key={e.id}
							title={e.title}
							type={e.href === null ? "disabled" : (this.props.active === e.id ? "active" : "inactive")}
						/>;
					})}
				</ul>
			</Navbar>
		);
	}
}

QNavbar.defaultProps = {
	active: null,
	brand: "",
	href: "#",
};
