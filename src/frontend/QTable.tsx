import React from "react";

export interface QTableProps {
	entries: ReadonlyArray<ReadonlyArray<string>>;
	showIndex: boolean;
	titles: ReadonlyArray<string>;
}

export default class QTable extends React.Component<QTableProps> {
	public static defaultProps: QTableProps = {
		entries: Object.freeze([]),
		showIndex: false,
		titles: Object.freeze([]),
	};

	constructor(props: QTableProps) {
		super(props);
	}

	public render() {
		this.props.entries.forEach(e => {
			if (e.length !== this.props.titles.length) {
				throw new Error("All rows must have the same length as the titles.");
			}
		});
		return (
			<table className="table table-striped">
				<thead>
					{
						this.props.showIndex &&
						<tr>
							<th scope="col">#</th>
						</tr>
					}
					{
						this.props.titles.length > 0 &&
						<tr>
							{this.props.titles.map(e => {
								return <th key={e} scope="col">{e}</th>;
							})}
						</tr>
					}
				</thead>
				<tbody>
					{this.props.entries.map((r, i) => {
						return (
							<tr key={i}>
								{
									this.props.showIndex &&
									<th key={i} scope="row">{i.toString()}</th>
								}
								{r.map(e => {
									return <td key={e}>{e}</td>;
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		);
	}
}
