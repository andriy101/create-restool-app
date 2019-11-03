#!/usr/bin/env node
'use strict';

const spawn = require('child_process').spawnSync;
const fs = require('fs');
const path = require('path');

const downloadGit = require('download-git-repo');
const figlet = require('figlet');
const chalk = require('chalk');

const appName = 'restool-app';
const appDir = `${process.cwd()}/${appName}`;
const tmpDir = `${appDir}/tmp`;
const spawnOpts = {
  stdio: 'inherit'
};
// assets path within create-restool-app module
const assetsPath = path.join(__dirname, '../files');


(async () => {
  console.log('ASDFG', assetsPath);
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
  spawn('npm', ['i'], spawnOpts);

  printSectionTitle('NPM run build');
  spawn('npm', ['run', 'build'], spawnOpts);

  printSectionTitle('Move dist folder');
  spawn('mv', ['dist', '../public'], spawnOpts);
  // copy config json and images from the module to public directory
  spawn('cp', [`${assetsPath}/config.json`, '../public'], spawnOpts);
  spawn('cp', ['-r', `${assetsPath}/images`, '../public'], spawnOpts);

  printSectionTitle('Remove build files');
  spawnOpts.cwd = appDir;
  spawn('rm', ['-rf', 'tmp'], spawnOpts);

  printSectionTitle('Create server');
  spawn('mkdir', ['server'], spawnOpts);

  // copy json server files from the module
  spawn('cp', [`${assetsPath}/db.json`, 'server'], spawnOpts);
  spawn('cp', [`${assetsPath}/routes.json`, 'server'], spawnOpts);

  printSectionTitle('Server: NPM init');
  spawnOpts.cwd = `${appDir}/server`;
  spawn('npm', ['init', '-y'], spawnOpts);

  printSectionTitle('Server: NPM install');
  spawn('npm', ['i', 'json-server', 'open-cli'], spawnOpts);
  // add run script to server package json file
  packageJson = JSON.parse(fs.readFileSync(`${appDir}/server/package.json`));
  packageJson.scripts.start = 'open-cli http://localhost:3000 & json-server db.json -s ../public -r routes.json';
  fs.writeFileSync(`${appDir}/server/package.json`, JSON.stringify(packageJson, null, 2));

  printSectionTitle('Run server');
  spawn('npm', ['start'], spawnOpts);

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