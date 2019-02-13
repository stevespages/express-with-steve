:doc:`Home </index>`

Node, NPM and NVM
=================

Install
-------

`Node Version Manager` (NVM) can be used to install and manage different versions of `Node`.

Instructions are at `https://github.com/creationix/nvm`. Run:

.. code::

   curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

Run `command -v nvm` to check it has installed (outputs `nvm`)

The latest release of Node (with npm included) is downloaded, compiled and installed with ``nvm install node``. Note this is the latest release not the current LTS version.

Node Modules
------------

In the Node.js module system, each file is treated as a separate module. Node.js has several modules compiled into the binary. These core modules are defined within Node.js's source code and are located in the lib/ folder. Core modules will be preferentially loaded if a file with the same name exists.

If the module identifier passed to `require()` is not a core module and does not begin with '/', '../' or './', then Node.js starts at the parent directory of the current module, and adds `/node_modules`. Node.js will not append `node_modules` to a pathe already ending in `node_modules`. If `node_modules` is not found there Node.js goes to the parent directory and looks for it. If it is not there it goes to the parent of that directory and so on until the root of the file systeme is reached.

Node Package Manager (NPM)
--------------------------

Node modules that use the npm system are (all?) listed at www.npmjs.com. A description of the package is found there. Also, a link to the github page is normally found. The github page often has the same information reproduced in a ReadMe file. Whether the documentation at npmjs.com and github is always the same I doubt. So, best to check out both.

Generally an npm package has the same name as its github page. For example `multer` is found at github.com/expressjs/multer and is installed with: ``npm install --save multer``. However, `express-session` is found at github.com/expressjs/session. It is installed with: ``npm install --save express-session``.

On the npm page for a package (for example npmjs.com/package/express) there is a link to the homepage (for example expressjs.com) and a link to the repository (github for express). For express-sessions the link to the homepage is the same link as for the repository except that it takes you to the ReadMe file on the github page not the top of the page. So, the express-sessions API is documented on the npm page and the github page and there is not an official website for it. The express module has the same information on its npm and github pages. The express API documentation is not on these pages it is on the expressjs.com website.

npm init
--------

A node project can be started by creating a root directory and changing directory into it and then running the command ``npm init``. If the tag `-y` is used then all the questions will be answered with a `yes`. Once we run `npm init -y` inside our new project directory we will create a `package.json` file.

npm install express
-------------------

We can now install our first node module, `express`. When we do this express will be added to the `package.json` file as a dependency.

app.js or index.js
------------------

Now we can create the key file for an express app. We will call this `app.js` although `index.js` is often used. The minimum content to create a working website is:

.. code::

   const express = require('express');
   
   const app = express();
   
   app.get('/', function(req, res, next){
           res.send('Hello World!');
   });
   
   app.listen(3000);

Next we need to open a new terminal and change directory into our project root directory. Then run `node app.js`.

Now if we go to `http://localhost:3000` in a browser we will see `Hello World!`.

nodemon
-------

Every time we change any file in the root directory of our project we will need to restart the server. However this can be done automatically using `nodemon`. First run ``npm install --save-dev nodemon``. This will show as a development dependency in `package.json`. We now need to modify `package.json`:

.. code::

   {
     "name": "my-app",
     "version": "1.0.0",
     "description": "",
     "main": "app.js",
     "scripts": {
       "test": "echo \"Error: no test specified\" && exit 1",
       "devstart": "nodemon ./bin/www"
     },
     "keywords": [],
     "author": "",
     "license": "ISC",
     "dependencies": {
       "express": "^4.16.4"
     },
     "devDependencies": {
       "nodemon": "^1.18.9"
     }
   }

We have added a key to the `scripts` object called `devstart` with a value of `nodemon ./bin/www`. Now we can start the app by opening a terminal, changing directory into the project's root directory and running the command `npm run devstart'.
