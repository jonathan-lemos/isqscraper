import fs from "fs";
import settings from "../settings";
import SqlServer from "./SqlServer";
import WebServer from "./WebServer";

const main = async () => {
	const sqlServer = await SqlServer.create({
		database: settings.sqlDbName,
		host: settings.sqlHost,
		password: settings.sqlPassword,
		port: settings.sqlPort,
		premade: settings.sqlPremade,
	});

	if ((await sqlServer.allProfessors()).length === 0) {
		const csv = fs.readFileSync(settings.professorCsvPath).toString().split("\n");
		await sqlServer.insertProfessorsFromCsv(csv);
	}

	const webServer = new WebServer(sqlServer, settings.webPort);
	webServer.listen().then(() => console.log(`Express web server listening on port ${settings.webPort}`));
};

main();
