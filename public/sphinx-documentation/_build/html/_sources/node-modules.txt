:doc:`Home </index>`

Node Modules
============

In the Node.js module system, each file is treated as a separate module. Node.js has several modules compiled into the binary. These core modules are defined within Node.js's source code and are located in the lib/ folder. Core modules will be preferentially loaded if a file with the same name exists.

If the module identifier passed to `require()` is not a core module and does not begin with '/', '../' or './', then Node.js starts at the parent directory of the current module, and adds `/node_modules`. Node.js will not append `node_modules` to a pathe already ending in `node_modules`. If `node_modules` is not found there Node.js goes to the parent directory and looks for it. If it is not there it goes to the parent of that directory and so on until the root of the file systeme is reached.

Node Package Manager (NPM)
--------------------------

Node modules that use the npm system are (all?) listed at www.npmjs.com. A description of the package is found there. Also, a link to the github page is normally found. The github page often has the same information reproduced in a ReadMe file. Whether the documentation at npmjs.com and github is always the same I doubt. So, best to check out both.

Generally an npm package has the same name as its github page. For example `multer` is found at github.com/expressjs/multer and is installed with: ``npm install --save multer``. However, `express-session` is found at github.com/expressjs/session. It is installed with: ``npm install --save express-session``.

On the npm page for a package (for example npmjs.com/package/express) there is a link to the homepage (for example expressjs.com) and a link to the repository (github for express). For express-sessions the link to the homepage is the same link as for the repository except that it takes you to the ReadMe file on the github page not the top of the page. So, the express-sessions API is documented on the npm page and the github page and there is not an official website for it. The express module has the same information on its npm and github pages. The express API documentation is not on these pages it is on the expressjs.com website.

