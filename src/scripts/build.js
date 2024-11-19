const fs = require('fs');
const path = require('path');
const sass = require('sass');
const fsPromises = fs.promises;

/* Define source path and destination path */
const sourcePath = path.resolve('src');
const projectPath = path.resolve('.');
const nodeModulesPath = path.resolve('node_modules');
const globalFileName = 'global.scss';
const distPath = projectPath.concat('/dist');
const globalDistPath = distPath.concat(`/${globalFileName.replace('scss', 'css')}`);
const componentTypes = ['atoms', 'molecules', 'organisms'];
const dirPermission = 0o755;

/**
 * @description Create directory if not exist
 * @param {string} dirPath directory path.
 * @author LethDz
 */
const createDir = async dirPath => {
  // Check if the directory exists
  try {
    await fsPromises.access(dirPath, fs.constants.F_OK);
    console.log(`Directory: ${dirPath} already exists`);
  } catch (error) {
    // Directory doesn't exist, create it
    return fsPromises.mkdir(dirPath, { recursive: true, mode: dirPermission });
  }
};

/**
 * @description Creating required directory
 * @author LethDz
 */
const createRequiredDir = async () => {
  /* ---------------- Step 1: Create 'dist' directory in source --------------- */
  await createDir(distPath);
  /* ---- Step 2: Create components directory in following `componentTypes` --- */
  const createDirPromise = componentTypes.map(type => {
    const typePath = distPath.concat(`/${type}`);
    return createDir(typePath);
  });
  try {
    await Promise.all(createDirPromise);
    console.log('Create required directory successfully!!!');
  } catch (error) {
    console.error('Creating required directory failed!!!', error);
  }
};

/* ----------------------- Step 3: compile Scss to Css ---------------------- */
/* ----------------------------- Using Legacy API ---------------------------- */
// Sass.renderSync({
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
/**
 * @description Compile scss file to css.
 * @param {string} sourcePath source path
 * @param {string} destPath destination path
 * @author LethDz
 */
const compileComponent = (path, fileName) => {
  const result = sass.compileString(fs.readFileSync(path).toString(), {
    style: 'expanded',
    loadPaths: [sourcePath, nodeModulesPath],
  });

  return fsPromises
    .writeFile(fileName, result.css.toString())
    .then(() => {
      console.info(`Write compile result to file: ${fileName}`);
    })
    .catch(err => {
      console.error(`Error to write compile result to file: ${fileName}`);
      console.error(`Error Message: ${err}`);
    });
};
/* Compile global.scss */
const globalSourcePath = sourcePath.concat(`/${globalFileName}`);

/* Scan and compile Components */
/**
 * @description Scan all defined files in following directory
 * that is defined in `componentTypes` variable and compile to css.
 * @author LethDz
 */
const scanAndCompileComponents = () => {
  const allComponents = new Map();
  const writePromise = [];
  // Scan
  componentTypes.forEach(type => {
    const allFiles = fs.readdirSync(`src/${type}`).map(file => ({
      fileName: file,
      path: path.resolve(`src/${type}/${file}`),
    }));
    allComponents.set(type, [...allFiles]);
  });

  // Compile
  allComponents.forEach((value, key) => {
    const destDir = projectPath.concat(`/dist/${key}`);
    value.forEach(file => {
      const cssFile = file.fileName.replace('scss', 'css');
      const targetFile = destDir.concat(`/${cssFile}`);
      writePromise.push(compileComponent(file.path, targetFile));
    });
  });

  return writePromise;
};

/**
 * @description compile function control the asynchronous operations.
 */
const compile = async () => {
  await createRequiredDir();
  const compileArray = [];
  compileArray.push(compileComponent(globalSourcePath, globalDistPath));
  compileArray.push(...scanAndCompileComponents());
  try {
    await Promise.all(compileArray);
    console.log('Compile scss to css successfully!!!');
  } catch (error) {
    console.log('Compile scss to css failed!!!', error);
  }
};

compile();
