import $ from "jquery";
import path from "path";

export interface Settings {
	professorCsvPath: string;
	sqlDbName: string;
	sqlHost: string;
	sqlPassword: string;
	sqlPort: number;
	sqlPremade: boolean;
	sqlUser: string;
	webBaseDir: string;
	webBaseFile: string;
	webPort: number;
}

export const defaultSettings: Settings = Object.freeze({
	professorCsvPath: path.join(__dirname, "../professors.csv"),
	sqlDbName: "isqscraper",
	sqlHost: "localhost",
	sqlPassword: "",
	sqlPort: 3306,
	sqlPremade: false,
	sqlUser: "root",
	webBaseDir: path.join(__dirname, "../site"),
	webBaseFile: "index.html",
	webPort: 80,
});

export const debugSettings: Settings = Object.freeze($.extend(defaultSettings, {
	professorCsvPath: path.join(__dirname, "../../professors.csv"),
	sqlDbName: "isqscraper_dbg",
	sqlPassword: "toor",
	sqlUser: "root",
	webBaseDir: path.join(__dirname, "../../site"),
	webPort: 3000,
}));

export const releaseSettings: Settings = Object.freeze($.extend(defaultSettings, {
	sqlPassword: "toor",
	sqlUser: "root",
}));
export default releaseSettings;
