:doc:`Home </index>`


Debugging
=========

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
