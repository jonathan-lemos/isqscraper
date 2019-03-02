import SqlServer from "../../src/backend/SqlServer";
import WebServer from "../../src/backend/WebServer";

describe("WebServer tests", async () => {

	it("constructs and listens", async () => {
		const con = await SqlServer.create({ user: "root", password: "toor" });
		try {
			const w = new WebServer(con, 3000);
			await w.listen();
			w.end();
		}
		catch (e) {
			expect(false);
		}
	});

	it("constructs main app and listens", async () => {
		const con = await SqlServer.create({ user: "root", password: "toor" });
		try {
			const w = WebServer.makeAppServer(con, 3000);
			await w.listen();
			w.end();
		}
		catch (e) {
			expect(false);
		}
	});
});
