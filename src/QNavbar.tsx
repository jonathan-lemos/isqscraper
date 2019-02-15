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

export const QNavbar: React.FC<QNavbarProps> = props => {
	return (
		<Navbar className="navbar navbar-expand-md navbar-light bg-light">
			<a className="navbar-brand" href={props.href}>{props.brand}</a>
			<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
				<span className="navbar-toggler-icon" />
			</button>
			<ul className="navbar-nav mr-auto">
				{props.entries.map(e => {
					return <QNavbarButton
						href={e.href === null ? "#" : e.href}
						identifier={e.id}
						key={e.id}
						type={e.href === null ? "disabled" : (props.active === e.id ? "active" : "inactive")}
					/>;
				})}
			</ul>
		</Navbar>
	);
};

QNavbar.defaultProps = {
	active: null,
	brand: "",
	href: "#",
};
