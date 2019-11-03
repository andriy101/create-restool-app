#!/usr/bin/env node
'use strict';

const spawn = require('child_process').spawnSync;
const fs = require('fs');
const path = require('path');

const downloadGit = require('download-git-repo');
const figlet = require('figlet');
const chalk = require('chalk');

// detect windows OS and use npm.cmd instead of npm
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const appName = 'restool-app';
const appDir = `${process.cwd()}/${appName}`;
const tmpDir = `${appDir}/tmp`;
const spawnOpts = {
  stdio: 'inherit'
};
// assets path within create-restool-app module
const assetsPath = path.join(__dirname, '../files');


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

  printSectionTitle('Server NPM install');
  spawnOpts.cwd = `${appDir}/server`;
  spawn(npmCommand, ['i'], spawnOpts);

  printSectionTitle('Run server');
  spawn(npmCommand, ['start'], spawnOpts);

  printSectionTitle('ENJOY RESTool');
})();


/**
 * print function, uses figlet module
 */
function printSectionTitle(title, chalkFunc) {
  title = figlet.textSync(title);
  console.log('');
  console.log(chalkFunc ? chalk[chalkFunc](title) : title);
  console.log('');
}