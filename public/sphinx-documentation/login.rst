:doc:`Home </index>`

Login
=====

Login Using bcrypt
------------------

.. code::

   npm init -y
   npm install express sqlite3 bcrypt

We can now create an sqlite database from the command line. Here we create a database called `myApp.db` and create a table called `users` in it with three fields: `id`, `username` and `password`.

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
   
   app.post('/register', function(req, res) {
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

The value of the password field can be broken down into four parts. After the initial $, 2b tells us bcrypt was used. After the second $ the work factor (10 in this case) is shown. After the third $ the salt is shown (about 22 characters??) followed by the hash. The work factor and salt are required by bcrypt in order to hash the password entered by the user when they login. 

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


express-session
---------------

.. code::

   npm init -y
   npm install express express-session

To start using sessions:

.. code::

   const express = require('express');

   const session = require('express-session'); 

   const app = express()
   
   app.use(session({
       secret: 'keyboard cat',
       resave: false,
       saveUninitialized: true
   }));
   
   app.get('/', function(req, res) {
       res.send('This is the home page.\n');
   }); 
   
   app.listen(8000);

Now when we send any http request to our app it will put a `set-cookie` header in the http response:

.. code::

   steve@Dell ~ $ curl http://localhost:8000 -v
   * Rebuilt URL to: http://localhost:8000/
   *   Trying 127.0.0.1...
   * Connected to localhost (127.0.0.1) port 8000 (#0)
   > GET / HTTP/1.1
   > Host: localhost:8000
   > User-Agent: curl/7.47.0
   > Accept: */*
   > 
   < HTTP/1.1 200 OK
   < X-Powered-By: Express
   < Content-Type: text/html; charset=utf-8
   < Content-Length: 23
   < ETag: W/"17-+SBl1pvz95MbiP75pqzkAN/LKnY"
   < set-cookie: connect.sid=s%3A3ETmeonNikhQIpfEopXAl4BW2eEhKklQ.BGN0%2FMwPOBEvLcPHRQI7lc%2BaR0gNDyof30WxAl%2BJphM; Path=/; HttpOnly
   < Date: Thu, 17 Jan 2019 18:03:59 GMT
   < Connection: keep-alive
   < 
   This is the home page.
   * Connection #0 to host localhost left intact
   steve@Dell ~ $

The output above shows request information prefixed with > and response information prefixed with <. We can see the value of the set-cookie header is `connect.sid=s%3A3ET......;`. This is unique value generated by `express-session`.

When a browser receives a `set-cookie` header it will store it. On subsequent http requests to the same domain it will include it as a `cookie` header. With `express-session` being used in our app the app will detect the cookie in the request header and it will include the value of this cookie for its `set-cookie` header in its response. If the browser did not return the `cookie` header `express-session` would generate a new value and use this for its `set-cookie` response header.

We can demonstrate this behaviour using `cURL` to send http requests to our `app.js` server. First let us repeat the get request we made before. We have not instructed `cURL` to add a `cookie` header to the request so `express-session` will generate a new `sid` (session id) and use this as the value of the `set-cookie` header in the http response:

.. code::

   steve@Dell ~ $ curl http://localhost:8000 -v
   * Rebuilt URL to: http://localhost:8000/
   *   Trying 127.0.0.1...
   * Connected to localhost (127.0.0.1) port 8000 (#0)
   > GET / HTTP/1.1
   > Host: localhost:8000
   > User-Agent: curl/7.47.0
   > Accept: */*
   > 
   < HTTP/1.1 200 OK
   < X-Powered-By: Express
   < Content-Type: text/html; charset=utf-8
   < Content-Length: 23
   < ETag: W/"17-+SBl1pvz95MbiP75pqzkAN/LKnY"
   < set-cookie: connect.sid=s%3A2IYiTLnw0OqupWfXKpis7S3e4a2IfUAv.6gzGeWu3jINT1qNc1OCum40jGCMxHNnncgmmBO%2BhEa0; Path=/; HttpOnly
   < Date: Thu, 17 Jan 2019 22:08:20 GMT
   < Connection: keep-alive
   < 
   This is the home page.
   * Connection #0 to host localhost left intact
   steve@Dell ~ $ 

Note that the `set-cookie`'s connect.sid value is different from the previous response. Now let us make another get request but with the -c option followed by the name of a file (on the client side) we want cookies to be stored in:

.. code::

   steve@Dell ~ $ curl http://localhost:8000 -v -c cookie-file.txt
   * Rebuilt URL to: http://localhost:8000/
   *   Trying 127.0.0.1...
   * Connected to localhost (127.0.0.1) port 8000 (#0)
   > GET / HTTP/1.1
   > Host: localhost:8000
   > User-Agent: curl/7.47.0
   > Accept: */*
   >
   < HTTP/1.1 200 OK
   < X-Powered-By: Express
   < Content-Type: text/html; charset=utf-8
   < Content-Length: 23
   < ETag: W/"17-+SBl1pvz95MbiP75pqzkAN/LKnY"
   * Added cookie connect.sid="s%3Ar2yNnAihsLNfrEtWGAaHJpGWwvMevumZ.bhSitM%2FkVPDQ5EVA1V3tPWxApBiMZ%2FJC5FknF8%2Bjfbs" for domain localhost, path /, expire 0
   < set-cookie: connect.sid=s%3Ar2yNnAihsLNfrEtWGAaHJpGWwvMevumZ.bhSitM%2FkVPDQ5EVA1V3tPWxApBiMZ%2FJC5FknF8%2Bjfbs; Path=/; HttpOnly
   < Date: Thu, 17 Jan 2019 22:13:41 GMT
   < Connection: keep-alive
   <
   This is the home page.
   * Connection #0 to host localhost left intact
   steve@Dell ~ $

We can see that a file called `cookie-file.txt` has been created and has the cookie in it here:

.. code::

   steve@Dell ~ $ cat cookie-file.txt 
   # Netscape HTTP Cookie File
   # http://curl.haxx.se/docs/http-cookies.html
   # This file was generated by libcurl! Edit at your own risk.
   
   #HttpOnly_localhost	FALSE	/	FALSE	0	connect.sid	s%3Ar2yNnAihsLNfrEtWGAaHJpGWwvMevumZ.bhSitM%2FkVPDQ5EVA1V3tPWxApBiMZ%2FJC5FknF8%2Bjfbs
   steve@Dell ~ $

If we now make the same `cURL` request but use -b followed by the file name (instead of -c as we used before), the cookie value from the file will be sent as the value of the `cookie` header in the request. Our app, using `express-session`, will compare the value of the cookie in the header with the value of any cookies it has sent out. If the cookie in the header is the same as a cookie it has stored then the browser must have been sent the cookie from the server.

If the initial cookie was sent to the browser in response to a successful login with username and password then repeated requests using the same cookie would be accepted by the server as sufficient evidence that the client was authorised to see password protected content on the site.

Once again we will send the request with the -b flag so as to include the client side stored cookie in the `cookie` header and we see we get exactly the same cookie back:

.. code::

   steve@Dell ~ $ curl http://localhost:8000 -v -b cookie-file.txt
   * Rebuilt URL to: http://localhost:8000/
   *   Trying 127.0.0.1...
   * Connected to localhost (127.0.0.1) port 8000 (#0)
   > GET / HTTP/1.1
   > Host: localhost:8000
   > User-Agent: curl/7.47.0
   > Accept: */*
   > Cookie: connect.sid=s%3Ar2yNnAihsLNfrEtWGAaHJpGWwvMevumZ.bhSitM%2FkVPDQ5EVA1V3tPWxApBiMZ%2FJC5FknF8%2Bjfbs
   >
   < HTTP/1.1 200 OK
   < X-Powered-By: Express
   < Content-Type: text/html; charset=utf-8
   < Content-Length: 23
   < ETag: W/"17-+SBl1pvz95MbiP75pqzkAN/LKnY"
   < Date: Thu, 17 Jan 2019 22:48:43 GMT
   < Connection: keep-alive
   <
   This is the home page.
   * Connection #0 to host localhost left intact
   steve@Dell ~ $

If a single character of the cookie is changed by editing the cookie in the cookie-file.txt file and then the request is made we get a new cookie sent back in a `set-cookie` response header:

.. code::

   steve@Dell ~ $ curl http://localhost:8000 -v -b cookie-file.txt
   * Rebuilt URL to: http://localhost:8000/
   *   Trying 127.0.0.1...
   * Connected to localhost (127.0.0.1) port 8000 (#0)
   > GET / HTTP/1.1
   > Host: localhost:8000
   > User-Agent: curl/7.47.0
   > Accept: */*
   > Cookie: connect.sid=s%3Ar2yNnAihsLNfrEtWGAaHJpGWwvMevumZ.bhSitM%2FkVPDQ5EVA1V3tPWxApBiMZ%2FJC5FknF8%2Bjfbt
   >
   < HTTP/1.1 200 OK
   < X-Powered-By: Express
   < Content-Type: text/html; charset=utf-8
   < Content-Length: 23
   < ETag: W/"17-+SBl1pvz95MbiP75pqzkAN/LKnY"
   * Replaced cookie connect.sid="s%3AgazSDLIya5bhYDxFpCi5TYaJ0rKCFcXr.%2FX85EGY5RC1oOX8ys%2BWu1BsEyu4B9OrVcb%2BjLL9%2BjoM" for domain localhost, path /, expire 0
   < set-cookie: connect.sid=s%3AgazSDLIya5bhYDxFpCi5TYaJ0rKCFcXr.%2FX85EGY5RC1oOX8ys%2BWu1BsEyu4B9OrVcb%2BjLL9%2BjoM; Path=/; HttpOnly
   < Date: Thu, 17 Jan 2019 22:53:54 GMT
   < Connection: keep-alive
   <
   This is the home page.
   * Connection #0 to host localhost left intact
   steve@Dell ~ $

In this case the server would have compared the incoming cookie from the browser with values in its cookie store and seen that this cookie was not in its store. Our app should make use of this by not allowing password protected data to be returned. The app, through `express-session` will respond with a new cookie value in the `set-cookie` header. Although the server sent a new cookie value back to the client we did not use the -c flag in our `cURL` request so we did not store it and therefore the old cookie (with the single modified character we made to it) is still in the `cookie-file.txt` file. If this is modified back to the original value and sent as a curl request we can see from the server's response that the server recognizes this cookie value and accepts it as valid from the fact that it does not send `set-cookie` header in its response:

.. code::

   steve@Dell ~ $ curl http://localhost:8000 -v -b cookie-file.txt
   * Rebuilt URL to: http://localhost:8000/
   *   Trying 127.0.0.1...
   * Connected to localhost (127.0.0.1) port 8000 (#0)
   > GET / HTTP/1.1
   > Host: localhost:8000
   > User-Agent: curl/7.47.0
   > Accept: */*
   > Cookie: connect.sid=s%3Ar2yNnAihsLNfrEtWGAaHJpGWwvMevumZ.bhSitM%2FkVPDQ5EVA1V3tPWxApBiMZ%2FJC5FknF8%2Bjfbs
   >
   < HTTP/1.1 200 OK
   < X-Powered-By: Express
   < Content-Type: text/html; charset=utf-8
   < Content-Length: 23
   < ETag: W/"17-+SBl1pvz95MbiP75pqzkAN/LKnY"
   < Date: Thu, 17 Jan 2019 23:04:13 GMT
   < Connection: keep-alive
   <
   This is the home page.
   * Connection #0 to host localhost left intact
   steve@Dell ~ $

Register, Login, Sessions
-------------------------

We can now bring registration, login and sessions into the same script:

.. code::

   npm init -y
   npm install express
   npm install express-session
   npm install bcrypt
   npm install sqlite3

.. code::

   const express = require('express');
   const bcrypt = require('bcrypt');
   const sqlite3 = require('sqlite3');
   const session = require('express-session');
   
   const app = express();
   
   const db = new sqlite3.Database('my-app.db')
   
   app.use(session({
       secret: 'process.env.SESSION_SECRET',
       resave: false,
       saveUninitialized: true
   }));
   
   // When a user logs in, the login script creates a property called userId 
   // on the req.session object. Any middleware or route handler functions can
   // test to see if req.session.userId is undefined (the current
   // user is not logged in) or defined (the current user is logged in). Also,
   // the value in req.session.userId can still be used by any script on the site to
   // obtain the identity of the logged in user.
   //
   // However we may want to implement a maximum period of inactivity for a user
   // after which they are no longer logged in. To do this we could have a middleware
   // script here which checks the value of req.session.userId. If it is undefined
   // the script does nothing. If it contains a userId AND the expires date has passed
   // req.session.userId is re-assigned to undefined. If req.session.userId contains a
   // userId and passes all the tests such as session expiry then the script will take
   // no action
   // 
   // Pseudocode:
   //
   //   app.use(function(req, res, next){
   //      if(req.session.userId){
   //         if(req.session.expires out of date)
   //            req.session.userId = undefined;
   //         }
   //      }
   //       next();
   //    });
   
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   
   // Is it a security risk having the user's unmodified password available in
   // req.body.password after it has been used to provide the hashedPassword? Should
   // it be overwritten or deleted?
   app.post('/register', function(req, res, next){
       const hashedPassword = bcrypt.hashSync(req.body.password, 10);
       console.log(req.body.username);
       console.log(hashedPassword)
       let sql = `INSERT INTO users(username, password) VALUES (?, ?)`;
       db.run(sql, [req.body.username, hashedPassword], () => {});
       res.end();
   });
   
   app.post('/login', function(req, res, next){
       let sql = `SELECT * FROM users WHERE username = ?`;
       db.get(sql, [req.body.username], function(err, row){
           if(!row){
               console.log('Invalid Username');
               res.end();
           } else {
               if(bcrypt.compareSync(req.body.password, row.password)){
                   req.session.userId = row.id;
                   console.log('Logged in user with id: ', req.session.userId);
                   res.end();
               } else {
                   console.log('Incorrect Password');
                   res.end();
               }
           }
       });
   });
   
   app.get('/', function(req, res, next){
       if(req.session.userId){
           res.send('Hi! You are logged in. Your id = ' + req.session.userId);
       } else {
           res.send('Hi! You are not logged in');
       }
   });
   
   app.listen(8000);

A post request to /register with values for username and password will result in a new row in the users table with three fields: id (automatically generated, unique and also forming the table's primary key), username and password. The password field will store passwords hashed with bcrypt.

A post request to /login with values for username and password will cause the login script to search the users table for a row where the username in the table matches the username supplied by the user in the login form. If a matching username is not found this script simply stops. A proper app would redirect back to the login form stating that their username is wrong. If a matching username is found the script then compares the bcrypt hashed password supplied by the user in the login script with the bcrypt hashed password they used when they registered. If the hashed passwords do not match our script stops but it should redirect the user to the login page stating that they have supplied an incorrect password. If the hashed passwords do match, the script assigns the id from the users table corresponding to that username to req.session.userId. Our app then stops but a real app would then redirect them to an appropriate route such as the home page.

When the logged in user makes a request to any page on the website (either through redirecting from the login script) or by clicking a link on the website the session cookie will be included in the http request header. In this case our app.use(session... express-session middleware will not generate a new cookie. The cookie supplied by the user's browser will be used and the app will have access to the session object that is associated with this particular cookie and which is stored on the server. Note that the session object has data which we can put in it such as userId and this is stored on the computer not sent to the browser with the cookie. The cookie just contains the session id. Our script (including any routes) can determine that a user is logged in or not by testing that session object's userId property (accessed by req.session.userId). That same property also tells us the identity of the user which can be used to fetch data specific to that user and return it to them in a web page. However, because we may want to consider other factors in determining whether a user is logged in or not, for example whether the session has expired, we can introduce middleware  before any routes which tests for these things. If we determine that the user should not be logged in we can simply assign req.session.user to undefined.

We could write a /logout route handler which reassigns req.session.userId to undefined and then redirects the user to the home page.

Note that several users could log into the site. Each would have a unique session id set as the value of the cookie sent to them and stored by them on their browser. On the server each of these session ids would be saved with the corresponding session object (req.session). All the users can be seen to be logged in by testing that in their invocation of our web script req.session.userId in not undefined. Each user's identity can be established and used to provide them with tailored information from the value of req.session.userId.

JSON Web Tokens
---------------

Instead of using sessions to perpetuate the logged in state we can use JWTs.

.. code::

   npm install jsonwebtoken
   
In app.js require it and also create a secret. Modify the post.login script to create and return a JWT if the user logs in successfully:

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

