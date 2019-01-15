:doc:`Home </index>`

Login
=====

Login Using bcrypt
------------------

Starting with an empty directory do npm init -y then npm install express sqlite3 bcrypt and then create an sqlite database called myApp.db and create a table called users in it with three fields: id, username and password.

.. code::

   steve@Dell ~/Desktop/myapp $ sqlite3 myApp.db
   SQLite version 3.11.0 2016-02-15 17:29:24
   Enter ".help" for usage hints.
   sqlite> CREATE TABLE users (
      ...> id INTEGER PRIMARY KEY,
      ...> username TEXT,
      ...> password TEXT
      ...> );

Now create an app.js file with a post route called register which will create a new user in the users table when a username and password is posted to it:

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

Now when we use httpie to send a post request to localhost:3000/register we create a new row in the users table in the myApp.db database. Here is the request:

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

The next step is to enable a registered user to login. We will create a new post route at /login in our app.js file:

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

Then httpie is used to post the correct details, followed by wrong username and finally wrong password:

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
---------------

Now run npm install jsonwebtoken. In app.js require it and also create a secret. Modify the post.login scriptto create and return a JWT if the user logs in successfully:

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

If we now make a successful login using httpie we can see a JWT is returned:

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

The browser would send this token back to the server on any future requests in its Authorization header. The server would verify the JWT and then return password protected data back to the browser. We can implement a get route in app.js to demonstrate this:

.. code::

   app.get('/secret', (req, res) => {
       const authHeaderValue = req.headers.authorization;
       const token = jsonwebtoken.verify(authHeaderValue, SECRET);
       return res.json({ message: "You made it" });
   });

Now when we make a request to the /secret route with the JWT in the Authorization header, the JWT is verified and the server returns the protected data:

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

In the get route to /secret the code should be in a try / catch block so that if the JWT is not verified a response can be sent to the browser indicating that they are not authorized. This can be seen here:

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
