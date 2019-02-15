import React from "react";

export interface QListProps {
	noItemsMsg: string;
}

export const QList: React.FC<QListProps> = props => {
	return (
		<ul className="list-group">
			{React.Children.count(props.children) > 0 ?
			React.Children.map(props.children, c => {
				return (
					<li className="list-group-item">
						c
					</li>
				);
			})
			: <h2>{props.noItemsMsg}</h2>}
		</ul>
	);
};

QList.defaultProps = {
	noItemsMsg: "No entries found",
};
