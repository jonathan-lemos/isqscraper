import React from "react";
import ReactDOM from "react-dom";
import QApp from "./QApp";

const byId = (id: string): HTMLElement  => {
	const l = document.getElementById(id);
	if (l === null) {
		throw new Error(`ID "${id}" is not a valid DOM node`);
	}
	return l;
};

ReactDOM.render(<QApp sqlHost="localhost" sqlPassword="toor" sqlUser="root"/>, byId("app"));
