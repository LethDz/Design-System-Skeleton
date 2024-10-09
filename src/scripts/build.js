const fs = require('fs');
const path = require('path');
const sass = require('sass');

/* Define source path and destination path */
const sourcePath = path.resolve('src');
const nodeModulesPath = path.resolve('node_modules');
const globalFilePath = path.resolve('src/global.scss');
const destPath = sourcePath.concat('\\dist\\global.css');

/* ----------------------------- Using Legacy API ---------------------------- */
// const compileResult = Sass.renderSync({
// 	data: Fs.readFileSync(
// 		globalFilePath
// 	).toString(),
// 	outputStyle: 'expanded',
// 	outFile: 'global.css',
// 	includePaths: [
// 		sourcePath
// 	],
// });

/* ----------------------------- Using Modern API ---------------------------- */

const compileResult = sass.compileString(fs.readFileSync(
	globalFilePath
).toString(), {
	style: "expanded",
	loadPaths: [sourcePath, nodeModulesPath]
});

fs.writeFileSync(destPath, compileResult.css.toString(), err => {
	console.error(`Error to write compile result to file: ${destPath}`);
	console.error(`Error Message: ${err}`);
});