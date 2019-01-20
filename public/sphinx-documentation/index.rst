.. Learning Express documentation master file, created by
   sphinx-quickstart on Mon Nov 12 17:34:49 2018.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Express With Steve
==================

.. toctree::
   :maxdepth: 2

   node-modules
   middleware
   debugging
   user-input
   databases
   login
   login2
   error-handling
   asynchronous
   file-structure
   template-engines
   deployment
   notes

.. highlight:: javascript

Overview
--------

I have attempted to isolate various aspects of node express into very simple complete express apps. Mostly all the code is in a single `app.js` file to make it easier to follow. Most of the examples can be followed by creating a new directory, changing directory into that directory, running ``npm init -y`` followed by ``npm install express``. Other modules can be installed as necessary. You will of course need `node` to be installed on your computer.

Create an Express App
---------------------

.. code::

   mkdir new-directory
   cd new-directory
   npm init -y
   npm install express



Use a text editor to create a file called `app.js` and place the following contents in it:

.. code::

   const express = require('express');

   const app = express();
   
   app.get('/example', function(req, res) {
   
      res.send('Hello World!');

   });
   
   app.listen(3000);

Now run the app from your terminal with the command ``node app.js``. Open a browser window and navigate to `www.localhost:3000/example`. You should see 'Hello World!

Links
.....

`expressjs.com/Getting Started/Installing`

`express.com/Getting Started/Hello World`

nodemon
.......

.. code::

   npm install nodemon

If any changes are made to the `app.js` code the server has to be stopped (use ``Ctr c``) and restarted (``node app.js``) and the browser window has to be refreshed in order for the changes to take effect. Installing `nodemon` and starting the app with ``nodemon app.js`` enables changes to `app.js` to be made without the need for manually restarting the server every time these changes are saved. The browser will still have to be refreshed manually. 

app.METHOD(PATH, HANDLER)
.........................

The `get` method of the express `app` object, `app.get()` is an example of the general pattern app.METHOD(PATH, HANDLER) where HANDLER is one function. Later in this tutorial we will see that a chain of HANDLER functions can be used. This is central to the Express middleware approach to app development.

.. code::

   const express = require('express');

   const app = express();
   
   app.get('/example', function (req, res) {
     res.send('Hello World!!')
   });
   
   app.listen(3000);

We can introduce a variable which we will call `firstName` with a value of 'Brian'. In a real app this might be the result of a database query. This can be used inside the `res.send` function so it is displayed in the browser. In the code below I have used a variable called `output` as the argument to `res.send()`. This will be helpful in later examples where there will be more to output to the browser.

.. code::

   const express = require('express');

   const app = express();
   
   app.get('/example', function (req, res) {
     let firstName = 'Brian'
     let output = 'Hello '
     output += firstName
     res.send(output)
   });
   
   app.listen(3000);

