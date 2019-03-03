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
	onChangeInput: (s: string) => void;
}

export default class QNavbar extends React.Component<QNavbarProps> {
	public static defaultProps = {
		active: null,
		brand: "",
		href: "#",
		onChangeInput: (s: string) => {/* */},
	};

	constructor(props: QNavbarProps) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	public render() {
		return (
			<Navbar className="navbar navbar-expand-md navbar-light bg-light mb-3 w-100 d-flex justify-content-center align-items-center">
				<div>
					<a className="navbar-brand" href={this.props.href}>{this.props.brand}</a>
					<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
						<span className="navbar-toggler-icon" />
					</button>
				</div>
				<input
					className="form-control form-inline mx-2 flex-grow-1"
					type="search"
					placeholder="Search"
					onChange={this.handleChange}/>
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

	private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		this.props.onChangeInput(event.target.value);
	}
}
