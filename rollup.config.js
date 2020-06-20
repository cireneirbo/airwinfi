//import commonJs from "@rollup/plugin-commonjs";
//import nodeBuiltins from "rollup-plugin-node-builtins";
//import nodeGlobals from "rollup-plugin-node-globals";
//import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
	"input": "public/js/main.ts",
	"output": {
		"file": "public/js/main.js",
		"format": "esm"
	},
	"external": [],
	"plugins": [
		//nodeResolve(),
		//commonJs(),
		//nodeBuiltins(),
		//nodeGlobals(),
		typescript()
	],
	"watch": {
		"clearScreen": false
	}
};
