# RESTool creator

[![npm version](https://img.shields.io/npm/v/create-restool-app.svg?style=flat)](https://www.npmjs.com/package/create-restool-app)
[![npm](https://img.shields.io/npm/dt/create-restool-app.svg)](https://npm-stat.com/charts.html?package=create-restool-app)
[![GitHub license](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/andriy101/create-restool-app/blob/master/LICENSE)

[![RESTool Sample App](https://raw.githubusercontent.com/dsternlicht/RESTool/master/screenshots/restool_screenshot.png)](https://github.com/dsternlicht/RESTool)

This module is an assistant creator module for [RESTool](https://github.com/dsternlicht/RESTool) sample app.

**Live Demo**: [https://restool-sample-app.herokuapp.com/](https://restool-sample-app.herokuapp.com/).


## Create local RESTool app using [Json Server](https://github.com/typicode/json-server) module:

    # with npm
    npm init restool-app <app-name>
    # or with yarn 
    yarn create restool-app <app-name>

    <app_name> is optional and defaults to 'restool-app'
  
    Options:
     -o, --open   Open app in default browser window (enabled by default)
     -p, --port   The port on which the app will be running (defaults to 3000)

Running `npm init restool-app <app-name>` command will:
* create new folder with provided `<app-name>` or 'restool-app' if not provided (it will be overridden if exists)
* download [RESTool code](https://github.com/dsternlicht/RESTool) from GIT
* install all needed NPM modules
* run Angular build on source code
* create server with all needed for JSON SERVER configuration files
* run and open RESTool sample app at localhost with provided port (defaults to 3000, make sure the port is not occupied by another tasks)


Created files structure will look like:
```
restool-app
...
└── public
    ├── index.html
    ├── config.json
    ├── App.js
    ...
└── server
    ├── package.json
    ├── db.json
    ├── routes.json
    ...
```

The application is started by running `npm start` from `server` folder.

Images of the sample app are downloaded from https://www.hbo.com
