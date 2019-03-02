import SqlServer from "./SqlServer";
import WebServer from "./WebServer";

const main = async () => {
	const sqlServer = await SqlServer.create({ user: "root", password: "toor" });
	const webServer = WebServer.makeAppServer(sqlServer, 3000);
	webServer.listen().then(() => console.log("Express web server listening on port 80"));
};

main();
