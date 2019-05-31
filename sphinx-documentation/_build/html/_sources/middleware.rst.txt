:doc:`Home </index>`


Middleware
==========

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
--------------------

This method is not used in the MDN tutorial for constructing the Local Library app. However the tutorial does describe it. In the code below the pattern is app.METHOD(PATH, HANDLER_1, HANDLER_2, HANDLER_3, HANDLER_4) where each HANDLER is a seperate function. The term next refers to the next function in the chain. So the first function has next as one of its arguments and this refers to the argument coming after it. The argument is used as the last statement in each function ensuring that the next function is indeed called.

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

In the code below we assign variables to the Request object in each of the middleware functions and display them to the browser in the final function in the chain. Note that the final function has been given ‘next‘ as one of its arguments even though it does not need it because it is the last argument.

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

We could have saved some typing by assigning the values directly to the Request object like this:

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
