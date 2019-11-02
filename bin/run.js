#!/usr/bin/env node
'use strict';

const spawn = require('child_process').spawnSync;
const fs = require('fs');

const downloadGit = require('download-git-repo');
const figlet = require('figlet');
const chalk = require('chalk');

const appName = 'restool-app';
const spawnOpts = {
  stdio: 'inherit'
};
// assets path within create-restool-app module
const assetsPath = `${spawn('npm', ['ls', 'create-restool-app', '-ps']).stdout.toString().trim()}/files`;


(async () => {
  printSectionTitle(`Create folder`);
  spawn('rm', ['-rf', appName], spawnOpts);
  spawn('mkdir', [appName], spawnOpts);

  printSectionTitle('Download RESTool');
  await new Promise((resolve, reject) => {
    downloadGit('dsternlicht/RESTool', 'tmp', err => {
      err ? reject(false) : resolve(true);
    })
  });
  spawn('rm', ['-rf', 'tmp/dist'], spawnOpts);

  printSectionTitle('NPM install');
  // remove prepare script from package json file
  let packageJson = JSON.parse(fs.readFileSync('tmp/package.json'));
  delete packageJson.scripts.prepare;
  fs.writeFileSync('tmp/package.json', JSON.stringify(packageJson, null, 2));
  spawnOpts.cwd = `${process.cwd()}/tmp`;
  spawn('npm', ['i'], spawnOpts);

  printSectionTitle('NPM run build');
  spawn('npm', ['run', 'build'], spawnOpts);

  printSectionTitle('Move dist folder');
  spawn('mv', ['dist', `../${appName}/public`], spawnOpts);
  // copy config json from the module
  spawn('cp', [`${assetsPath}/config.json`, `../${appName}/public`], spawnOpts);

  printSectionTitle('Remove build files');
  spawnOpts.cwd = process.cwd();
  spawn('rm', ['-rf', 'tmp'], spawnOpts);

  printSectionTitle('Create server');
  spawn('mkdir', [`${appName}/server`], spawnOpts);

  // copy json server files from the module
  spawn('cp', [`${assetsPath}/db.json`, `${appName}/server`], spawnOpts);
  spawn('cp', [`${assetsPath}/routes.json`, `${appName}/server`], spawnOpts);

  printSectionTitle('Server - NPM init');
  spawnOpts.cwd = `${process.cwd()}/${appName}/server`;
  spawn('npm', ['init', '-y'], spawnOpts);

  printSectionTitle('Server - NPM install');
  spawn('npm', ['i', 'json-server', 'open-cli'], spawnOpts);
  // add run script to server package json file
  packageJson = JSON.parse(fs.readFileSync(`${appName}/server/package.json`));
  packageJson.scripts.start = 'open-cli http://localhost:3000 & json-server db.json -s ../public -r routes.json';
  fs.writeFileSync(`${appName}/server/package.json`, JSON.stringify(packageJson, null, 2));

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