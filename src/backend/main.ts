import SqlServer from "./SqlServer";
import { makeAppServer } from "./WebServer";

const main = async () => {
	const sqlServer = await SqlServer.create({user: "root", password: "toor"});
	const webServer = makeAppServer(sqlServer);
	webServer.listen().then(() => console.log("Express web server listening on port 80"));
};

main();
