import React from "react";
import { ActiveType } from "./QApp";

export type QNavbarButtonType = "active" | "inactive" | "disabled";

export interface QNavbarButtonProps {
	href: string;
	identifier: ActiveType;
	title: string;
	type: QNavbarButtonType;
}

export class QNavbarButton extends React.Component<QNavbarButtonProps> {
	public static defaultProps = {
		href: "#",
		title: "Title",
		type: "inactive",
	};

	public render() {
		const liClass = "nav-item" + (this.props.type === "active" ? " active" : "");
		const aClass = "nav-link" + (this.props.type === "disabled" ? " disabled" : "");
		return (
			<li className={liClass}>
				<a className={aClass} href={this.props.href}>
					{this.props.title}
				</a>
			</li>
		);
	}
}
