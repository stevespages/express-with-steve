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
   error-handling
   asynchronous
   file-structure
   template-engines
   deployment

.. highlight:: javascript

Overview
--------

I have attempted to isolate various aspects of node express into very simple complete express apps. Mostly all the code is in a single `app.js` file to make it easier to follow.

Create an Express App
---------------------
The following is based closely on the instructions at `expressjs.com/Getting Started/Installing` and `express.com/Getting Started/Hello World`.

Install node globally. Make a directory with the name you have chosen for the app. From a command line terminal change directory so you are in the new app directory and run ``npm init -y``. Install Express by running the command ``npm install express``.

Create a file called `app.js` and place the following contents in it:

.. code::

   const express = require('express');

   const app = express();
   
   app.get('/example', (req, res) => res.send('Hello World!'));
   
   app.listen(3000, () => console.log(`Go to localhost:3000`));

Now run the app from your terminal with the command ``node app.js``. Open a browser window and navigate to `www.localhost:3000/example`. You should see 'Hello World!

nodemon
.......

If any changes are made to the `app.js` code the server has to be restarted and the browser window has to be refreshed in order for the changes to take effect. Follow the MDN tutorial instructions for installing the nodemon module and modifying the package.json file. This will obviate the need for restarting the server after making changes to the app. Also, useful information will be displayed in the console if the app is started with the command: ``DEBUG=myapp:* npm run devstart``. Now we can modify the app and just refresh the browser to see the changes.

app.METHOD(PATH, HANDLER)
.........................

The `get` method of the express `app` object, `app.get()` is an example of the general pattern app.METHOD(PATH, HANDLER) where HANDLER is one function. Later in this tutorial we will see that a chain of HANDLER functions can be used. This is central to the Express middleware approach to app development.

Here we have the same code as before but with the handler function written in a different but equivalent form which is more suitable when there is more code inside it.

.. code::

   const express = require('express')
   const app = express()
   const port = 3000
   
   app.get('/example', function (req, res) {
     res.send('Hello World!!')
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))

We can introduce a variable which we will call `firstName` with a value of 'Brian'. In a real app this might be the result of a database query. This can be used inside the `res.send` function so it is displayed in the browser. In the code below I have used a variable called `output` as the argument to `res.send()`. This will be helpful in later examples where there will be more to output to the browser.

.. code::

   const express = require('express')
   const app = express()
   const port = 3000
   
   app.get('/example', function (req, res) {
     let firstName = 'Brian'
     let output = 'Hello '
     output += firstName
     res.send(output)
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))

Notes

*  The Express Application Generator generates: var express = require('express'); Check this: still using var? semicolon? The Express Hello world example: const express = require('express' 4.16.4 ) with no semicolon. Is there any significance to these discrepancies? When I tried to run the version ($ node app.js) with 4.16.4 it threw an error. I removed 4.16.4 so I just had 'express' as argument to require and it worked.

*  The MDN Local Library tutorial uses the async module. For the home page a number of queries to the MongoDB are made to obtain the number or books, authors, genres and bookinstances in the library. It appears that these functionsare supplied in the form of a list (eg. an iterable) as the first argument to async.parallel(). When they have all run the second argument to async.parallel() (the callback function) is run using the results from the list of functions as input on which to act. This second argument (the callback) could send the results of the list of functions to the browser using res.render() for example. How does this pattern relate to the middleware concept of req, res, next()? 

*  Can you do: app.METHOD(PATH, HANDLER_1, HANDLER_2)?

*  The two variable thing: 
   For various reasons it is usually not a good idea to have more than one database query in the same handler function. It is better to chain middleware functions with each having one database query in it. Only the last middleware function can send results to the browser. The problem of scope arises because a variable created in one function will not normally be available in the next one. There seem to be two approaches to solving this. A variable created in one function can be converted into a property of the Request object. So, in our example we could do the following: req.firstName = firstName. Now the value of the firstName variable will be available to all future functions in the middleware chain.

* I can do res.send(req.body) or (errors.array()) and both give a useful output. If I combine them: res.send(req.body + errors.array()) it does not work. If I try and assign both to a variable and then use that ie. res.send(variable) it still fails. It seems to be errors.array() that is the problem. The best I can get when trying to combine it with req.body is [object Object]
