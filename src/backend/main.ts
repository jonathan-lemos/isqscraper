import fs from "fs";
import path from "path";
import SqlServer from "./SqlServer";
import WebServer from "./WebServer";

const main = async () => {
	const port = 3000;
	const sqlServer = await SqlServer.create({ user: "root", password: "toor" });
	if ((await sqlServer.allProfessors()).length === 0) {
		const csv = fs.readFileSync(path.join(__dirname, "../../professors.csv")).toString().split("\n");
		await sqlServer.insertProfessorsFromCsv(csv);
	}
	const webServer = WebServer.makeAppServer(sqlServer, port, path.join(__dirname, "../../site"));
	webServer.listen().then(() => console.log(`Express web server listening on port ${port}`));
};

main();
