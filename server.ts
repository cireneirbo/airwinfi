import * as fs from "fs";
import * as path from "path";
import express from "express";
import helmet from "helmet";
import logger from "morgan";

import { config } from "./config";

export const app = express();

app.use(helmet());

app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");

if (config.get("env") !== "production") {
	app.use(logger("dev"));
}

app.use(express.static(path.join(__dirname, "public")));

(function bindRoutes(routesDirectory) {
	const files = [];

	(function recurse(directory) {
		for (const file of fs.readdirSync(directory)) {
			if (fs.statSync(path.join(directory, file)).isDirectory()) {
				recurse(path.join(directory, file));
			} else if (path.extname(file).toLowerCase() === ".ts") {
				files.push(path.join(directory, file));
			}
		}
	})(routesDirectory);

	for (const file of files) {
		const route = require(file);

		for (let verb of Object.keys(route)) {
			if (verb === "del") {
				verb = "delete";
			}

			const parsedPath = path.parse(file.substring(routesDirectory.length));
			let pathName = parsedPath.dir;

			if (parsedPath.name !== "index") {
				pathName = path.join(pathName, parsedPath.name);
			}

			pathName = pathName.replace(/\\/g, "/");

			if (route[verb].length === 2) {
				console.log("Binding " + verb.toUpperCase() + " " + pathName);

				app[verb](pathName, route[verb]);
			} else {
				const { path = pathName, middleware = [], callback } = route[verb](pathName);

				console.log("Binding " + verb.toUpperCase() + " " + path);

				app[verb](path, ...middleware, callback);
			}
		}
	}
})(path.join(__dirname, "routes"));

app.listen(config.get("port"), function() {
	console.log("Listening on port " + this.address().port);
});
