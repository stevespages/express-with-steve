:doc:`Home </index>`

Databases
=========

Create an SQLite Database
-------------------------

sqlite official documentation: https://www.sqlite.org/lang.html

sqlite node module official documentation: https://github.com/mapbox/node-sqlite3/wiki

Tutorial for sqlite3 and sqlite3 node module: http://www.sqlitetutorial.net/

For a tutorial that covers the use of the sqlite3 Relational Database Management System (RDBMS) on the command line and use of the sqlite3 node module see www.sqlitetutorial.net

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

