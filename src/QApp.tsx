import React from "react";

export type ActiveType = "Home" | "Sylabus" | "Events" | "REPL" | "Invalid";

export interface QAppProps {
	active: ActiveType;
	brand: string;
	href: string;
}

export class QApp extends React.Component<QAppProps> {
	public static defaultProps: QAppProps = {
		active: "Home",
		brand: "Big Data Discord",
		href: "#",
	}
}
