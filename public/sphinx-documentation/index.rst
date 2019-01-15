.. Learning Express documentation master file, created by
   sphinx-quickstart on Mon Nov 12 17:34:49 2018.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Express With Steve
==================

.. toctree::
   :maxdepth: 2

   hallo

.. highlight:: javascript

Overview
--------

Note To Self
............

The examples should all be closely based on the MDN code....


Provide references to modules' documentation wherever relevant so process of accessing documentation is clarified.

********************************************************************************************************************

This tutorial is based on the Mozilla Development Network (MDN) Express Web Framework Tutorial. While the MDN tutorial builds a prototype of a catalog for an online local library with over 30 routes I have kept the code simple and short. All the node-express code examples are written in a single file: `app.js`. The explanations here are attempts to provide simplified examples of the topics covered in the MDN tutorial. This tutorial could be used with or without the MDN tutorial.

The MDN tutorial uses the MongoDB database with the node module mongoose. I have additionally touched on the use of SQLite. The MDN tutorial uses the Express Application Generator to start their app. I have used Express on its own and installed other modules when they become necessary.

Create an Express App
---------------------
The following is based closely on the instructions at `expressjs.com/Getting Started/Installing` and `express.com/Getting Started/Hello World`.

Install node globally. Make a directory with the name you have chosen for the app. From a command line terminal change directory so you are in the new app directory and run ``npm init``. Install Express by running the command ``npm install express --save``.

Create a file called `app.js` and place the following contents in it:

.. code::

   const express = require('express')
   const app = express()
   
   app.get('/example', (req, res) => res.send('Hello World!'))
   
   app.listen(3000, () => console.log(`listening on port 3000
   (fields, message) => check(fields, locations, message)

Now run the app from your terminal with the command ``node app.js``. Open a browser window and navigate to `www.localhost:3000/example`. You should see 'Hello World!

If any changes are made to the `app.js` code the server has to be restarted and the browser window has to be refreshed in order for the changes to take effect. Follow the MDN tutorial instructions for installing the nodemon module and modifying the package.json file. This will obviate the need for restarting the server after making changes to the app. Also, useful information will be displayed in the console if the app is started with the command: ``DEBUG=myapp:* npm run devstart``. 

Now we can modify the app and just refresh the browser to see the changes. The `get` method of the express `app` object, `app.get()` is an example of the general pattern app.METHOD(PATH, HANDLER) where HANDLER is one function. Later in this tutorial we will see that a chain of HANDLER functions can be used. This is central to the Express middleware approach to app development.

Here we have the same code as before but with the handler function written in a different but equivalent form which is more suitable when there is more code inside it.

.. code::

   const express = require('express')
   const app = express()
   const port =3000
   
   app.get('/example', function (req, res) {
     res.send('Hello World!!')
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))

We can introduce a variable which we will call `firstName` with a value of 'Brian'. In a real app this might be the result of a database query. This can be used inside the `res.send` function so it is displayed in the browser. In the code below I have used a variable called `output` as the argument to `res.send()`. This will be helpful in later examples where there will be more to output to the browser.

.. code::

   const express = require('express')
   const app = express()
   const port =3000
   
   app.get('/example', function (req, res) {
     let firstName = 'Brian'
     let output = 'Hello '
     output += firstName
     res.send(output)
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))


Create an SQLite Database
-------------------------

sqlite official documentation: https://www.sqlite.org/lang.html

sqlite node module official documentation: https://github.com/mapbox/node-sqlite3/wiki

Tutorial for sqlite3 and sqlite3 node module: http://www.sqlitetutorial.net/

See sqlite.org for definitive documentation on SQLite. For a tutorial that covers the use of the sqlite3 Relational Database Management System (RDBMS) on the command line and use of the sqlite3 node module see sqlitetutorial.net

First install sqlite3 globally. Then, from a terminal (while in the root directory of the app) run the command sqlite3 x where x is the name of the database you would like to create. In this case the database will be called `music.db` and we will then create a table called `musicians`:

.. code::

   steve@Dell ~/Desktop/myapp $ sqlite3 music.db
   SQLite version 3.11.0 2016-02-15 17:29:24
   Enter ".help" for usage hints.
   sqlite> CREATE TABLE musicians (
   ...> id INTEGER PRIMARY KEY,
   ...> firstName TEXT,
   ...> lastName TEXT
   ...> );
   sqlite> 


We now have a file called `music.db` in the root directory of our app. This is an SQLite database with a table called `musicians` in it. The table has three columns. The `id` column is known as an `integer primary key`. Case is important for the type specification: INTEGER PRIMARY KEY. Do not use autoincrement as it is usually not needed and it reduces performance. It is not necessary to provide values for `id` when inserting rows into the table. SQLite will automatically generate a unique value and insert it into this column for every row created in the table. So we only need to insert data for the `firstName` and `lastName fields`:

.. code::

   sqlite> INSERT INTO musicians
   ...> (firstName, lastName)
   ...> VALUES
   ...> ("Brian", "Eno");

If we query this table to select all the values in it we can see that SQLite automatically created a value (1) for the `id` field:

.. code::

   sqlite> SELECT * FROM musicians;
   1|Brian|Eno
   sqlite> 

Foreign Keys
............

You can have foreign keys in tables but if you want these to constrain SQL operations allowable then foreign key support needs to be turned on. At the command line this requires ``sqlite> PRAGMA foreign_keys = ON'``. To see if they are on use: ``sqlite> PRAGMA foreign_keys;``. This will return 0 if support is off and 1 if support is on. From node you could turn foreign key support on for every query or by using an anonymous callback into the function which creates the SQLite session used throughout the code:

.. code::

   var db = new sqlite3.Database(config.DB, function() {
     db.run('PRAGMA foreign_keys=on');
   });

To see if foreign key support is on from the node script:

.. code::

   db.get('PRAGMA foreign_keys', function(err, res) {
     console.log('pragma res is ' + res.foreign_keys);
   });

This comes from: https://sysdef.xyz/post/2012-07-20-node-sqlite-foreign-keys


Database Query from the Express App
-----------------------------------

SQLite3 is an RDBMS that, as we have seen, can be used on the command line to create databases and do SQL CRUD (Create, Read, Update and Delete) operations. It is also the name of an NPM (Node Package Manager) module. Installing the sqlite3 module in a node app allows a Database object to be instantiated. The methods available on this object enable SQL CRUD operations to be carried out from within the node app.

So, first we need to install the sqlite3 module in our app. Open a terminal, change to the myapp directory and run the command:

.. code::

   npm install sqlite3

Then open `app.js` in a text editor and import the sqlite3 module and create the Database object which we will call `db`. When we create the database object we pass the path to `music.db` to it so that the `music` database is connected to the object. The two lines of code we need are const ``sqlite3 = require('sqlite3').verbose()`` and ``let db = new sqlite3.Database('music.db')``. This can be seen below where the full contents of `app.js` are reproduced: 

.. code::

   const express = require('express')
   const app = express()
   const sqlite3 = require('sqlite3').verbose()
   const port =3000
   
   let db = new sqlite3.Database('music.db')
   
   app.get('/example', function (req, res, next) {
     let firstName = 'Brian'
     let output = 'Hello '
     output += firstName
     res.send(output)
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))

In the code above we have created an sqlite3 database object but we are not actually using it to do anything. Let us remove the two lines where we assign a value of 'Brian' to the variable `firstName` and replace it with a query to our `music.db` database using the `get` method of our database object, `db`:

.. code::

   const express = require('express')
   const app = express()
   const sqlite3 = require('sqlite3').verbose()
   const port =3000
   
   let db = new sqlite3.Database('music.db')
   
   app.get('/example', function (req, res, next) {
   
     let sql = `SELECT * FROM musicians`     
     db.get(sql, (err, row) => {
       let output = 'His name is '
       output += row.firsName + row.lastName + '!'
       res.send(output)
     })
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))


In the example above we create our sqlite3 Database object, `db`, in the global space. We can see from the code that we have created an express object called `app` (``const app = express()``) and we are using the `get` method of this object. Inside that method we call the sqlite3 Database object method (`db.get()`). I have added an exclamation mark to the output to the browser otherwise there would be no change to the output using this new code and we may think we have not refreshed the browser.

If the handler only makes one database query we can put the res.send() or res.render() method inside the function that makes the query. This can be seen in the example above where res.send() is inside the db.get() function. If more than one query is necessary it would be better to use the `async` module. This allows the queries to be made and for them all to pass their result to the same callback function.

Login Using bcrypt
------------------

Starting with an empty directory do ``npm init -y`` then ``npm install express sqlite3 bcrypt`` and then create an sqlite database called myApp.db and create a table called users in it with three fields: `id`, `username` and `password`.

.. code::

   steve@Dell ~/Desktop/myapp $ sqlite3 myApp.db
   SQLite version 3.11.0 2016-02-15 17:29:24
   Enter ".help" for usage hints.
   sqlite> CREATE TABLE users (
      ...> id INTEGER PRIMARY KEY,
      ...> username TEXT,
      ...> password TEXT
      ...> );

Now create an app.js file with a post route called `register`  which will create a new user in the users table when a username and password is posted to it: 

.. code::

   const express = require('express');
   const bcrypt = require('bcrypt');
   const sqlite3 = require('sqlite3').verbose();
   
   const app = express()
   
   const db = new sqlite3.Database('myApp.db');
   
   app.use(express.json());
   
   app.post('/register', (req, res) => {
       console.log('You posted to the /register path');
       console.log(req.body.username);
       const hash = bcrypt.hashSync(req.body.password, 10);
       console.log('hash: ', hash);
       let sql = `INSERT INTO users(username, password) VALUES (?, ?)`;
       db.run(sql, [req.body.username, hash], () => {});
       res.end();
   });
   
   app.listen(3000, () => {
       console.log('See localhost:3000');

Now when we use `httpie` to send a post request to `localhost:3000/register` we create a new row in the users table in the myApp.db database. Here is the request:

.. code::

  steve@Dell ~ $ http POST localhost:3000/register username='fred' password='secret'

and here is the new row in the table:

.. code::

  steve@Dell ~/Desktop/myapp $ sqlite3 myApp.db 
  SQLite version 3.11.0 2016-02-15 17:29:24
  Enter ".help" for usage hints.
  sqlite> select * from users;
  1|fred|$2b$10$sCN1XYjW/q/51QBOgwfPRuiq.fccVaNAbjUhSw0lKuHkUUszeecZG
  sqlite>  

The next step is to enable a registered user to login. We will create a new post route at `/login` in our `app.js` file:

.. code::

   app.post('/login', (req, res) => {
       console.log('You posted to the /login path');
       let sql = `SELECT * FROM users WHERE username = ?`; 
       db.get(sql, [req.body.username], (err, row) => {
           if(!row){
               console.log('Invalid Username');
               res.end();
           } else {
               if(bcrypt.compareSync(req.body.password, row.password)){
                   console.log('You are logged in');
                   res.end();
               } else {
                   console.log('Incorrect Password');
                   res.end()
               }
           }
       })
   }); 

Then `httpie` is used to post the correct details, followed by wrong username and finally wrong password:

.. code::

   http POST localhost:3000/login username='fred' password='secret'
   http POST localhost:3000/login username='frediii' password='secret'
   http POST localhost:3000/login username='fred' password='wrongpassword'

This gave the following output in the console:

.. code::

   [nodemon] restarting due to changes...
   [nodemon] starting `node app.js`
   See localhost:3000
   You posted to the /login path
   You are logged in
   You posted to the /login path
   Invalid Username
   You posted to the /login path
   Incorrect Password

We have now reached a point where our app is able to register new users by storing their username and hashed password in the users table of our database. We have also enabled them to login in by supplying a username and password. If there is a username in the users table corresponding to the one they login with and if the hashed password from the database is the same as the hashed password they supply at login our app is recognizes this.

We now need a way of enabling this logged in user to make requests to our web site without having to keep logging in for every request. This can be done by initiating a cookie based session or by JSON Web Tokens (JWT).

JSON Web Tokens
...............

Now run ``npm install jsonwebtoken``. In `app.js` require it and also create a secret. Modify the `post.login` scriptto create and return a JWT if the user logs in successfully:

.. code::

   const express = require('express');
   const bcrypt = require('bcrypt');
   const sqlite3 = require('sqlite3').verbose();

   // NEW CODE
   const jsonwebtoken = require('jsonwebtoken');
   
   const app = express()
   
   const db = new sqlite3.Database('myApp.db');
  
   // NEW CODE 
   const SECRET = "NEVER MAKE THIS PUBLIC IN PRODUCTION";
   
   app.use(express.json());
   
   app.post('/register', (req, res) => {
       console.log('You posted to the /register path');
       console.log(req.body.username);
       const hash = bcrypt.hashSync(req.body.password, 10);
       console.log('hash: ', hash);
       let sql = `INSERT INTO users(username, password) VALUES (?, ?)`;
       db.run(sql, [req.body.username, hash], () => {});
       res.end();
   });
   
   app.post('/login', (req, res) => {
       console.log('You posted to the /login path');
       let sql = `SELECT * FROM users WHERE username = ?`;
       db.get(sql, [req.body.username], (err, row) => {
           if(!row){
               console.log('Invalid Username');
               res.end();
           } else {
               if(bcrypt.compareSync(req.body.password, row.password)){
                   console.log('You are logged in');
   
                   // NEW CODE
                   const token = jsonwebtoken.sign(
                       { username: row.username },
                       SECRET,
                       { expiresIn: 60 * 60 }
                   );
                   return res.json({ token });
                   // END OF NEW CODE
   
               } else {
                   console.log('Incorrect Password');
                   res.end()
               }
           }
       })
   });
   
   app.listen(3000, () => {
       console.log('See localhost:3000');
   });

If we now make a successful login using `httpie` we can see a JWT is returned:

.. code::

   steve@Dell ~ $ http POST localhost:3000/login username='fred' password='secret'
   HTTP/1.1 200 OK
   Connection: keep-alive
   Content-Length: 164
   Content-Type: application/json; charset=utf-8
   Date: Sun, 13 Jan 2019 23:26:08 GMT
   ETag: W/"a4-jxHLjTk91r3su8TlKUVWUnsFyjk"
   X-Powered-By: Express
   
   {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZyZWQiLCJpYXQiOjE1NDc0MjE5NjgsImV4cCI6MTU0NzQyNTU2OH0.wbfYTs5bkvIyn7XcYvzVPAFE0JPrXnkyH2fbg0zFX_s"
   }
   
   steve@Dell ~ $

The browser would send this token back to the server on any future requests in its `Authorization` header. The server would verify the JWT and then return password protected data back to the browser. We can implement a `get` route in `app.js` to demonstrate this:

.. code::

   app.get('/secret', (req, res) => {
       const authHeaderValue = req.headers.authorization;
       const token = jsonwebtoken.verify(authHeaderValue, SECRET);
       return res.json({ message: "You made it" });
   });

Now when we make a request to the `/secret` route with the JWT in the `Authorization` header, the JWT is verified and the server returns the protected data:

.. code::

   steve@Dell ~ $ http get localhost:3000/secret Authorization:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZyZWQiLCJpYXQiOjE1NDc0MjE5NjgsImV4cCI6MTU0NzQyNTU2OH0.wbfYTs5bkvIyn7XcYvzVPAFE0JPrXnkyH2fbg0zFX_s"
   HTTP/1.1 200 OK
   Connection: keep-alive
   Content-Length: 25
   Content-Type: application/json; charset=utf-8
   Date: Sun, 13 Jan 2019 23:57:59 GMT
   ETag: W/"19-pXLuIQc7MqYjz2bJcUKii/lc2L0"
   X-Powered-By: Express
   
   {
       "message": "You made it"
   }

In the `get` route to `/secret` the code should be in a `try / catch` block so that if the JWT is not verified a response can be sent to the browser indicating that they are not authorized. This can be seen here:

.. code::

   app.get('/secret', (req, res) => {
       try { 
           const authHeaderValue = req.headers.authorization;
           const token = jsonwebtoken.verify(authHeaderValue, SECRET);
           return res.json({ message: "You made it" });
       } catch(e) {
           return res.status(401).json({ message: "Unauthorized" });
       } 
   });

Now we send a request with the JWT followed by one in which a single character of the JWT has been changed from a z to a y:

.. code::

   steve@Dell ~ $ http get localhost:3000/secret Authorization:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZyZWQiLCJpYXQiOjE1NDc0MjE5NjgsImV4cCI6MTU0NzQyNTU2OH0.wbfYTs5bkvIyn7XcYvzVPAFE0JPrXnkyH2fbg0zFX_s"
   HTTP/1.1 200 OK
   Connection: keep-alive
   Content-Length: 25
   Content-Type: application/json; charset=utf-8
   Date: Mon, 14 Jan 2019 00:14:07 GMT
   ETag: W/"19-pXLuIQc7MqYjz2bJcUKii/lc2L0"
   X-Powered-By: Express
   
   {
       "message": "You made it"
   }
   
   steve@Dell ~ $ http get localhost:3000/secret Authorization:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZyZWQiLCJpYXQiOjE1NDc0MjE5NjgsImV4cCI6MTU0NzQyNTU2OH0.wbfYTs5bkvIyn7XcYvzVPAFE0JPrXnkyH2fbg0yFX_s"
   HTTP/1.1 401 Unauthorized
   Connection: keep-alive
   Content-Length: 26
   Content-Type: application/json; charset=utf-8
   Date: Mon, 14 Jan 2019 00:14:38 GMT
   ETag: W/"1a-pljHtlo127JYJR4E/RYOPb6ucbw"
   X-Powered-By: Express
   
   {
       "message": "Unauthorized"
   }
   
   steve@Dell ~ $ 

   
Error Handling
--------------

The `db.get()` function used here has two arguments. The first is the sql query that it should run on the database it is connected to. The second argument is a callback function that the developer can write to make use of the result of the query to the database. We chose to write a function which sends the result to the browser. The function the devloper supplies should have two arguments here called `err` and `row`. The query result supplied to our callback function has two parts. The first is the error value and the second is the result value. If there is no error the first part of the result will be null and the second part will have data from the query. If there was an error the first part will have a description of the error and the second, result, part will be null. This enables the result to be processed on success and an error to be generated on failure of the query.

Debugging
---------

We may not know what sort of data structure our query result is. This is a question that may arise in many situations when programming. One way to find out is to include a ``console.log()`` statement in our code. This will be logged to the console when we refresh the browser. The code above is reproduced below with an additional statement: ``console.log(row)``.

.. code::

   const express = require('express')
   const app = express()
   const sqlite3 = require('sqlite3').verbose()
   const port =3000
   
   let db = new sqlite3.Database('music.db')
   
   app.get('/example', function (req, res, next) {
     let sql = `SELECT * FROM musicians`
     db.get(sql, (err, row) => {
       console.log(row)
     })
       let output = 'His name is '
       output += row.firsName + row.lastName + '!'
       res.send(output)
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))

When this is run the output to the browser is the same but in the console we see:

.. code::

   Example app listening on port 3000
   [nodemon] restarting due to changes...
   [nodemon] starting `node ./bin/www app.js`
   Example app listening on port 3000
   { id: 1, firstName: 'Brian', lastName: 'Eno' }


MongoDB and mongoose
--------------------

A Mongo database consists of JSON objects called collections in which the keys are assigned values. A mongoose schema can be written which describes the a particular collection and which inherits mongoose methods for CRUD operations. An example from the MDN tutorial is shown below:

.. code::

   var mongoose = require('mongoose');
   
   var Schema = mongoose.Schema;
   
   var BookSchema = new Schema(
     {
       title: {type: String, required: true},
       author: {type: Schema.Types.ObjectId, ref: 'Author', required: true},
       summary: {type: String, required: true},
       isbn: {type: String, required: true},
       genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}]
     }
   );
   
   // Virtual for book's URL
   BookSchema
   .virtual('url')
   .get(function () {
     return '/catalog/book/' + this._id;
   });
   
   //Export model
   module.exports = mongoose.model('Book', BookSchema);

After instantiation of the BookSchema object from the mongoose Schema object a 'virtual' is then added to the schema.
Virtuals can combine data from different fields of the collection with hard coded data. In the example here a virtual for a URL for a specific book is constructed using the _id field from the database and hardcoded details for other parts of the URL ('/catalog/book/').

countDocuments() is an example of a mongoose schema method which will be available to a schema object such as BookSchema.

User Input: Forms
-----------------

Note To Self
............

Explain that value of input element's name attribute will be accessible from the req object and can be used to persist or display or validate sanitize etc.....

According to express-validator maintainer: "...all methods accessible from the req object are considered legacy" see https://stackoverflow.com/questions/50430625/getting-req-getvalidationresult-is-not-a-function-with-expess-validator and the link from that. "...validationResult(req) is the correct way... [it is] synchronous". So the MDN tutorial is preferred to the example I have given which is taken from an (oherwise) excellent turtorial at https://booker.codes/input-validation-in-express-with-express-validator/

********************************************************************************************************************

The code shown below displays a simple form in the browser:

.. code::

   const express = require('express')
   const app = express()
   const port =3000
   
   app.get('/example', function (req, res, next) {
     let output = '<form method="post">'
     output += '<input type="text" name="firstName" placeholder="first name">'
     output += '<input type="text" name="lastName" placeholder="last name">'
     output += '<input type="submit" value="submit">'
     res.send(output)
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))

Because the form element does not have an action attribute the form will be sent to the same URL that was used to display it. In this case that is localhost:3000/example. The form element's method attribute is set to post. So, at the moment the app program does not have a route for handling the submitted form. We need to create a new route in our app with the same URL as the existing one but with post not get as the method. This is shown below.

.. code::

   const express = require('express')
   const app = express()
   const port =3000
   
   app.get('/example', function (req, res, next) {
     let output = '<form method="post">'
     output += '<input type="text" name="firstName" placeholder="first name">'
     output += '<input type="text" name="lastName" placeholder="last name">'
     output += '<input type="submit" value="submit">'
     res.send(output)
   })
   
   app.post('/example', function (req, res, next) {
     res.send('Your form has been recieved')
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))

In the example above the route specified as the first argument in the app.post() method (the route is '/example') is matched when the form is submitted causing the function supplied as the second argument to app.post() to be executed. It simply uses the res.send() method to send 'Your form has been recieved' to the browser. A real app would probably use a series of middlware functions to process the data which might include saving it to a database or making a database query using the submitted data to search a database


Validate and Sanitize
---------------------

We want to control the data that is sent to our app from the user. The data can be validated. If the data is not valid, for example a date has been entered using a format that our code will not recognize, the form can be displayed again to the user. This time the various form fields will contain the values the user entered with error messages helping them to alter their input to a form that will validate.

Once a form is submitted which passes the validation stage it may be sanitized. This actually changes the data. It can strip white spaces and escape html code.

Express provides the express-validator module which include built in validation and sanitization methods as well as enabling custom built methods to be built.

``npm install express-validator``

The express-validator module requires the `body-parser` module so we need to install this:

``npm install body-parser``

If you use the Express Application Generator to start your project it will install body-parser. Otherwise you should install it.

These two modules are imported into the app.js file below and used to validate the `firstName` field submitted by the form:

.. code::

   // This method is deprecated. DO NOT USE!

   const express = require('express')
   const bodyParser = require('body-parser')
   const validator = require('express-validator')
   const app = express()
   const port =3000
   
   app.use(bodyParser.urlencoded({ extended: false }))
   app.use(validator())
   
   app.get('/example', function (req, res, next) {
     let output = '<form method="post">'
     output += '<input type="text" name="firstName" placeholder="first name">'
     output += '<input type="text" name="lastName" placeholder="last name">'
     output += '<input type="submit" value="submit">'
     res.send(output)
   })
   
   app.post('/example', function (req, res) {
     req.checkBody("firstName", "Enter valid name").isLength({ min: 1 })
     var errors = req.validationErrors()
     if(errors){
       res.send(errors)
       return
     } else {
       res.send('OK' + errors)
     }
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))

The code below is similar to the previous example but it conforms more closely to the approach taken in the MDN tutorial and the `express-validator` documentation.

.. code::

   const express = require ('express')
   const bodyParser = require('body-parser')
   const { check, validationResult } = require('express-validator/check')
   const app = express()
   const port = 3000
   
   app.use(bodyParser.urlencoded({ extended: false }))
   
   app.get('/', function (req, res) {
   let output = '<form method="post">'
   output += '<input type="text" name="firstName" placeholder="first name">'
   output += '<input type="text" name="lastName" placeholder="last name">'
   output += '<input type="submit" value="submit">'
   res.send(output)
   })
   
   app.post('/', [check('firstName').isEmail()], function (req, res) {
   const errors = validationResult(req)
   console.log(errors)
   if(!errors.isEmpty()){
   res.send('errors')
   return
   } else {
   res.send('OK')
   }
   })
   
   
   app.listen(port, () => console.log(`listening on port ${port}`))

If the form is submitted with a value for the `firstName` input field less than 1 character long (ie. if nothing is entered into that form element by the user) then the `errors` variable will have a value so `res.send(errors)` will be executed. If the user enters a value in the `firstName` field `errors` will not have a value and so `res.send('OK' + errors)` will be executed

The express middleware function `app.use()` appears twice in the above function. This is an example of Express middleware. If a route is not provided as an argument to `app.use()` then it will run every time an http request is made to the app no matter what route is in the URL. In the code above the order of the `app.use()` statements is important. The body-parser functions need to be executed before the validator functions can be executed.

In order to test and debug post routes you can construct a get route which displays a form (with ``method='post'``). Then fill in the form with values which are chosen to test the post route and then submit the form. The post route will then be called and the resuls displayed in the browser and/or console. This is long winded particularly because once you have sumbitted the form returning to the site elicits a pop up which other than cancel only allows you to resend the data that was submitted previously. To circumvent this you need to type a different url in the address bar, visit that site  and then type the original url. Alternatively,  a new tab can be used to visit the original url. You can use `curl` as a more convenient way to send a post request.

Using curl
----------

To make a curl post request:

.. code::

   curl -d firstName=steve@stevespages.org -d lastName=xyz -d submit=submit localhost:3000

The above request returned OK to the browser since it passed the validation test in the post handler function. When the @ symbol was deleted it returned `errors` because it failed the isEmail() validation test. See https://ec.haxx.se/http-post.html.

Links
.....

https://ec.haxx.se/

Middleware
----------

The code for our app is still of the general form app.METHOD(PATH, HANDLER) where HANDLER is one function. In our code this function does two major things: it queries a database and it sends information to the browser. The information sent to the browser is partly hardcoded (for example 'His name is ') and partly dynamically derived from the database (for example `row.firstName`). Because of the imposition of scope limitations the information from the database is only accessible from within the function (`db.get()`) in which it was generated. If we move the `res.send()` function outside the `db.get()` function but still keeping it within the HANDLER function the browser shows an error: '`ReferenceError: row is not defined`'. The code is shown below:

.. code::

   const express = require('express')
   const app = express()
   const sqlite3 = require('sqlite3').verbose()
   const port =3000
   
   let db = new sqlite3.Database('music.db')
   
   app.get('/example', function (req, res, next) {
     let sql = `SELECT * FROM musicians`
     db.get(sql, (err, row) => {
       console.log(row)
     })
     res.send('His name is ' + row.firstName + ' ' + row.lastName + '!')
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))

Where we just have one query it is fine to keep the `res.send()` function within the `db.get()` function. However if more than one query were to be made to this or other databases or if other functionality were required we would want to move the `res.send()` function outside of the `db.get()` function. There are several ways to do this. Which method is most appropriate will depend on the situation. Two approaches will be discussed here. Firstly chaining functions with next and secondly using the `async` object.

Chaining with next()
....................

This method is not used in the MDN tutorial for constructing the Local Library app. However the tutorial does describe it. In the code below the pattern is app.METHOD(PATH, HANDLER_1, HANDLER_2, HANDLER_3, HANDLER_4) where each HANDLER is a seperate function. The term `next` refers to the `next` function in the chain. So the first function has `next` as one of its arguments and this refers to the argument coming after it. The argument is used as the last statement in each function ensuring that the next function is indeed called.

.. code::

   const express = require('express')
   const app = express()
   const port =3000
   
   app.get('/example',
     function (req, res, next) { ... next() },
     function (req, res, next) { ... next() },
     function (req, res, next) { ... next() },
     function (req, res, next) {
       res.send('Hello')
     }
   )
   
   app.listen(port, () => console.log(`app listening on port ${port}`))

In the code below we assign variables to the Request object in each of the middleware functions and display them to the browser in the final function in the chain. Note that the final function has been given '`next`' as one of its arguments even though it does not need it because it is the last argument.

So, we can now encapsulate different functionality into different middleware functions and still have the results from them available to send to the browser at the end of the middleware chain. An example of several database queries is shown below:

.. code::

   const express = require('express')
   const app = express()
   const port =3000
   
   app.get('/example',
     function (req, res, next) {
       let query1 = 'one '
       req.query1 = query1
       next()
     },
     function (req, res, next) {
       let query2 = 'two '
       req.query2 = query2
       next()
     },
     function (req, res, next) {
       let query3 = 'three'
       req.query3 = query3
       next()
     },
     function (req, res, next) {
       res.send('Hello ' + req.query1 + req.query2 + req.query3)
     }
   )
   
   app.listen(port, () => console.log(`app listening on port ${port}`))


We could have saved some typing by assigning the values directly to the `Request` object like this:

.. code::

   const express = require('express')
   const app = express()
   const port =3000
   
   app.get('/example',
     function (req, res, next) {
       req.query1 = 'one ' 
       next()
     },
     function (req, res, next) {
       req.query2 = 'two ' 
       next()
     },
     function (req, res, next) {
       req.query3 = 'three ' 
       next() },
     function (req, res, next) {
       res.send('Hello ' + req.query1 + req.query2 + req.query3)
     }
   )
   
   app.listen(port, () => console.log(`listening on port ${port}`))

The async Module
................

This method allows a number of functions to be run either in parallel or in series. The functions all call the same callback function and they can all pass information to it. This approach is used in the MDN Local Library tutorial as it is applicable where repeated database queries are necessary.

Node Modules
------------

In the Node.js module system, each file is treated as a separate module. Node.js has several modules compiled into the binary. These core modules are defined within Node.js's source code and are located in the lib/ folder. Core modules will be preferentially loaded if a file with the same name exists.

If the module identifier passed to `require()` is not a core module and does not begin with '/', '../' or './', then Node.js starts at the parent directory of the current module, and adds `/node_modules`. Node.js will not append `node_modules` to a pathe already ending in `node_modules`. If `node_modules` is not found there Node.js goes to the parent directory and looks for it. If it is not there it goes to the parent of that directory and so on until the root of the file systeme is reached.

Node Package Manager (NPM)
..........................

Node modules that use the npm system are (all?) listed at www.npmjs.com. A description of the package is found there. Also, a link to the github page is normally found. The github page often has the same information reproduced in a ReadMe file. Whether the documentation at npmjs.com and github is always the same I doubt. So, best to check out both.

Generally an npm package has the same name as its github page. For example `multer` is found at github.com/expressjs/multer and is installed with: ``npm install --save multer``. However, `express-session` is found at github.com/expressjs/session. It is installed with: ``npm install --save express-session``.

On the npm page for a package (for example npmjs.com/package/express) there is a link to the homepage (for example expressjs.com) and a link to the repository (github for express). For express-sessions the link to the homepage is the same link as for the repository except that it takes you to the ReadMe file on the github page not the top of the page. So, the express-sessions API is documented on the npm page and the github page and there is not an official website for it. The express module has the same information on its npm and github pages. The express API documentation is not on these pages it is on the expressjs.com website.

Synchronous vs Asynchronous
---------------------------

Views with PUG
--------------

Express File Structure
----------------------

Deployment
----------

Notes
-----

*  The Express Application Generator generates: var express = require('express'); Check this: still using var? semicolon? The Express Hello world example: const express = require('express' 4.16.4 ) with no semicolon. Is there any significance to these discrepancies? When I tried to run the version ($ node app.js) with 4.16.4 it threw an error. I removed 4.16.4 so I just had 'express' as argument to require and it worked.

*  The MDN Local Library tutorial uses the async module. For the home page a number of queries to the MongoDB are made to obtain the number or books, authors, genres and bookinstances in the library. It appears that these functionsare supplied in the form of a list (eg. an iterable) as the first argument to async.parallel(). When they have all run the second argument to async.parallel() (the callback function) is run using the results from the list of functions as input on which to act. This second argument (the callback) could send the results of the list of functions to the browser using res.render() for example. How does this pattern relate to the middleware concept of req, res, next()? 

*  Can you do: app.METHOD(PATH, HANDLER_1, HANDLER_2)?

*  The two variable thing: 
   For various reasons it is usually not a good idea to have more than one database query in the same handler function. It is better to chain middleware functions with each having one database query in it. Only the last middleware function can send results to the browser. The problem of scope arises because a variable created in one function will not normally be available in the next one. There seem to be two approaches to solving this. A variable created in one function can be converted into a property of the Request object. So, in our example we could do the following: req.firstName = firstName. Now the value of the firstName variable will be available to all future functions in the middleware chain.

* I can do res.send(req.body) or (errors.array()) and both give a useful output. If I combine them: res.send(req.body + errors.array()) it does not work. If I try and assign both to a variable and then use that ie. res.send(variable) it still fails. It seems to be errors.array() that is the problem. The best I can get when trying to combine it with req.body is [object Object]



Indices and tables
==================


