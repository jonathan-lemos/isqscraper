const path = require("path");

module.exports = {
	mode: "development",
	entry: {
		frontend: "./src/frontend/main.tsx",
		backend: "./src/backend/main.ts",
	},
	devtool: "inline-source-map",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/
			}
		]
	},
	node: {
		fs: "empty",
		net: "empty",
		tls: "empty",
	},
	resolve: {
		extensions: [ ".tsx", ".ts", ".js" ]
	},
	output: {
		filename: "[name]-bundle.js",
		path: path.resolve(__dirname, "dist")
	}
};
