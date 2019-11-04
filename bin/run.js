#!/usr/bin/env node
'use strict';

const spawn = require('child_process').spawnSync;
const fs = require('fs');
const path = require('path');

const args = require('args');
const downloadGit = require('download-git-repo');
const figlet = require('figlet');
const chalk = require('chalk');

// detect windows OS and use npm.cmd instead of npm
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const appArgs = getArgs();
const appName = appArgs.appName || 'restool-app';
const appDir = `${process.cwd()}/${appName}`;
const tmpDir = `${appDir}/tmp`;
const spawnOpts = {
  stdio: 'inherit'
};
// assets path within create-restool-app module
const assetsPath = path.join(__dirname, '../files');
const startTime = new Date().getTime();


(async () => {
  printSectionTitle(`Create folder`);
  spawn('rm', ['-rf', appName], spawnOpts);
  spawn('mkdir', [appName], spawnOpts);

  printSectionTitle('Download RESTool');
  await new Promise((resolve, reject) => {
    downloadGit('dsternlicht/RESTool', tmpDir, err => {
      err ? reject(false) : resolve(true);
    })
  });
  spawn('rm', ['-rf', `${tmpDir}/dist`], spawnOpts);

  printSectionTitle('NPM install');
  // remove prepare script from package json file
  let packageJson = JSON.parse(fs.readFileSync(`${tmpDir}/package.json`));
  delete packageJson.scripts.prepare;
  fs.writeFileSync(`${tmpDir}/package.json`, JSON.stringify(packageJson, null, 2));
  spawnOpts.cwd = tmpDir;
  spawn(npmCommand, ['i'], spawnOpts);

  printSectionTitle('NPM run build');
  spawn(npmCommand, ['run', 'build'], spawnOpts);

  printSectionTitle('Move dist folder');
  spawn('mv', ['dist', '../public'], spawnOpts);
  // copy config json and images from the module to public directory
  spawn('cp', ['-a', `${assetsPath}/public/.`, '../public/'], spawnOpts);

  printSectionTitle('Remove build files');
  spawnOpts.cwd = appDir;
  spawn('rm', ['-rf', 'tmp'], spawnOpts);

  printSectionTitle('Copy server files');
  spawn('cp', ['-r', `${assetsPath}/server`, '.'], spawnOpts);
  // add start script
  packageJson = JSON.parse(fs.readFileSync(`${appDir}/server/package.json`));
  let startScript = `npx json-server db.json -s ../public -r routes.json -p ${appArgs.port}`;
  // open browser if open flaf is set
  if (appArgs.open) {
    startScript = `${startScript} & npx open-cli http://localhost:${appArgs.port}`;
  }
  packageJson.scripts.start = startScript;
  fs.writeFileSync(`${appDir}/server/package.json`, JSON.stringify(packageJson, null, 2));

  printSectionTitle('Server NPM install');
  spawnOpts.cwd = `${appDir}/server`;
  spawn(npmCommand, ['i'], spawnOpts);

  printSectionTitle('Run server');
  spawn(npmCommand, ['start'], spawnOpts);
  spawn('open-cli', [`http://localhost:${appArgs.port}`], spawnOpts);

  printSectionTitle('ENJOY RESTool');
})();


/**
 * print function, uses figlet module
 */
function printSectionTitle(title, chalkFunc) {
  title = figlet.textSync(title);
  console.log('  ' + chalk.bold.green(`(${Math.round((new Date().getTime() - startTime) / 1000)} seconds)`));
  console.log(chalkFunc ? chalk[chalkFunc](title) : title);
  console.log('');
}

/**
 * get provided in CLI flags and arguments
 */
function getArgs() {
  args.option('port', 'The port on which the app will be running', 3000);
  args.option('open', 'Open app in default browser window', true);

  const pArgs = process.argv.map(a => ['false', 'true'].includes(a) ? JSON.parse(a) : a)
  const flags = args.parse(pArgs, {
    version: false,
    usageFilter: (msg) => {
      const lines = msg.split('\n  \n');
      lines[1] = '  <app_name> is optional and defaults to \'restool-app\'';
      return lines.join('\n  \n')
        .replace('[options] [command]', '<app_name> [options]')
        .replace('33mcreate', '33mnpm init')
        .replace('<n>', '   ');
    }
  });
  return {
    ...flags,
    appName: args.sub[0]
  };
}