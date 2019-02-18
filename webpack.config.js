const path = require("path");

const frontendConfig = {
	mode: "development",
	entry: "./src/frontend/main.tsx",
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
	resolve: {
		extensions: [ ".tsx", ".ts", ".js" ]
	},
	output: {
		filename: "frontend-bundle.js",
		path: path.resolve(__dirname, "site")
	}
};

const backendConfig = {
	mode: "development",
	entry: "./src/backend/main.ts",
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
	target: "node",
	output: {
		filename: "backend-bundle.js",
		path: path.resolve(__dirname, "dist")
	}
};

module.exports = [
	frontendConfig,
	backendConfig,
];
