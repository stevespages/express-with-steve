:doc:`Home </index>`

Login
======

Overview
--------

It is very often important for the response from a website to be tailored to the particular person who requested that response. In order to do this the server side script generating the response needs to have access to the identity of the user and what that user is authorized to access. Some websites may have several levels of authorization. Non logged in users can see some material while logged in ordinary users can additionally see password protected material and logged in administrators can edit material on the website. An overview of a typical implementation of a simple login system is given below.

On initial registration the user supplies a username and password which is stored in a database on the server. The database will generate a unique user id for each user. Other information supplied by the user at registration or on later visits to the website may also be stored. Also information such as the date and time the user registered may be stored if it is likely to be useful. So after registration there will be a row in a `users` table corresponding to that user. The three columns (often called fields) of interest to the login mechanism are the `user id`, `username`, and `password`. The username is often the email address of the user and a verification step can be introduced involving sending an email to the user asking them to click a link if they want to register with the website. At its simplest a registered user consists of a single row in a `users` table with the three columns referred to above in it.

When the user wants to login to the website they submit a form which posts a request to the website with their username and password. The server looks in the `users` table for a row in which the username matches the username given in the login form. It then extracts the password from that row and compares it with the password supplied by the user in the login form. If the passwords match the server then extracts the `user id` from the same row in the table and assigns it to a program variable which can be accessed from any part of the code that provides the website's functionality. That program variable can provide two pieces of information. The first is the fact that it has been assigned a value. This indicates that a user is logged in and could be used to decide whether or not to display material that should not be available to non logged in users but which can be viewed by all logged in users. If the variable has not been assigned a value then the program knows that the user of the website is not logged in. The second piece of information the variable provides is the `user id` that was assigned to it. This can enable the program to fetch material specific to that user, for example from a database, and display it to them.

The system described above would need the user to login to every page they visited on the website because there is no mechanism to remember that they are logged in. Every time they make a request for a page the server treats them as if they are a new unknown user. In order for the login to persist for a number of requests to the same site the server can send a unique string of characters to the users computer and keep a copy of that unique string together with the user's `user id`. When the browser makes requests to the same website (the same domain) it will include this unique string in its request. The server will compare the string with all the strings it has sent out (each one represents a different user) and select the one that matches it and extract the `user id` associated with it. It will put this into the program variable discussed in the previous paragraph thereby reinstating the logged in state for that particular user. The unique string here will either be a session cookie or part of a session cookie or part of a JSON Web Token (JWT).

We now have an outline description of how a login session might work. In order to obtain a more complete picture we need to consider mechanisms to encrypt the passwords, Hyper Text Transfer Protocol (HTTP) headers, cookie sessions and JWTs.

Password Hashing
----------------

If the passwords were stored in the users table unaltered it would be a security risk because the computer they were stored on might be accessed by a criminal. It is normal practice to encrypt the passwords with an algorithm called `bcrypt` which creates a long (around 50) unique string of characters from any password. The bcrypt algorithm has the property that given the same string (password in this case) it will always give the same output. However, it can not be used in reverse to recreate a password from the encrypted password. In fact there is no known way of reversing the bcrypt encryption of a password.

When the password is posted to the server during registration the server script should encrypt it with bcrypt and only store the encrypted version in the `users` table. When the password is posted to the server during login it should be encrypted with bcrypt and the encrypted version compared with the encrypted version stored in the `users` table.

As described above the `users` table, if it fell into the wrong hands, could still be a security risk even though the passwords are all encrypted. This is because it is possible to feed in very large numbers of candidate passwords into the bcrypt algorithm and construct a table of passwords with their corresponding bcrypt hash. This is known as a rainbow table. Now if any of the bcrypt hashes in the rainbow table is the same as one of the bcrypt hashes in the `users` table then that user's username and password are now known to the criminal.

Two factors make the rainbow table approach to hacking users' passwords difficult. Firstly, bcrypt is very slow because it requires a lot of processing power to hash a password. This means that it takes a long time even with powerful computers to generate a rainbow table. Despite this it would be feasable albeit expensive for large rainbow tables to be made. The second factor is that before the passwords are hashed by bcrypt a random string of characters (called a salt) is added to the passwords. This makes a rainbow table much less useful to the criminal since with the salt added nobodys password will be in a dictionary or a list of pets names and they will all be very long even if the users password was very short.

When the salt (random string of characters) is added to a user's password at registration it is necessary to store the salt with the hashed password in the `users` table. This is because the same salt needs to be appended to the user's password when they log in before bcrypt hashes it for comparison with the value in the table. The salt for each user is therefore recorded in the `users` table. A criminal could make a rainbow table by adding a particular user's salt to a large number of possible passwords and hashing them all with bcrypt. In effect the criminal now needs to construct a rainbow table for each user. This together with the slowness of bcrypt makes this system or storing passwords resistant to rainbow attacks.

An example of the output from the node bcrypt module's implementation of bcrypt is: ``$2a$10$Ns876QMLlCV4nT5ctzDHJeRMrvbVvZeGHn3gtJ6sJn5fILfEivZGa`` This is representitive of what would be stored in the `password` field of our `users` table.

The output can be broken down into four parts:

.. code::

   2a -> prefix
   10 -> work factor
   Ns876QMLlCV4nT5ctzDHJe -> salt
   RMrvbVvZeGHn3gtJ6sJn5fILfEivZGa -> hashed password

The first part indicates that bcrypt was used to generate the string. Next is the `work factor` which is 10 in this case. The higher this number the more processing power is required for bcrypt to generate the hash. By including it in the output of the hash, bcrypt can use that same number if it is asked to hash and compare a password with one it has previously hashed with that work number. Next is the salt which enables bcrypt to add this to a password if it is asked to hash and compare a password with one it has previously hashed with the same salt.

Passwords for more important confidential information can be hashed using higher work factors giving greater security for a small cost. Also, as computers get more powerful the work factor used can be increased to maintain the same level of security for users' passwords.

Registration Script
-------------------

A website will likely have a page with a form on for people to register. The user would enter their username and password into the form and click a submit button. This would send an http post request to the server with the username and password in it. To keep things simple we will make http requests to the server using the command line with a program called `cURL`. So, now we just need to write the script that handles the incoming http post request by storing the username and hashed password in a database. Before that we need to create the database. I will use SQLite which is a very widely used non-server based SQL database.

First we create a new directory and change directory into it and then ``npm init -y`` which creates a `package.json` file enabling us to install the `node package modules` (npm) that will be used to create an express app to handle the http post requests:

.. code::

   mkdir my-app
   cd my-app
   npm init -y
   npm install express
   npm install sqlite3
   npm install bcrypt

The `sqlite3` npm module provides an SQL command line interface as well as SQL functionality inside node apps. So now we can create an sqlite database called `my-app` with a `users` table in it from the command line. We create an `id` field and specify a type of INTEGER since the id values will be integers. We also specify that this field should be the  primary key for the table. Then we create the `username` and `password` fields and specify TEXT as the type of data that will be stored in them:

.. code::

   steve@Dell ~/Desktop/my-app $ sqlite3 my-app.db
   SQLite version 3.11.0 2016-02-15 17:29:24
   Enter ".help" for usage hints.
   sqlite> CREATE TABLE users (
      ...> id INTEGER PRIMARY KEY,
      ...> username TEXT,
      ...> password TEXT
      ...> );

We should now have a file called `my-app.db` inside our `my-app` directory. The next step is to create the express app with a post route in it for handling http post requests. Create an `app.js` file with the following code in it:

.. code::

   const express = require('express');
   const bcrypt = require('bcrypt');
   const sqlite3 = require('sqlite3');
   
   const app = express();
   
   const db = new sqlite3.Database('my-app.db');
   
   app.use(express.json());
   
   app.post('/register', function(req, res) {
       const hash = bcrypt.hashSync(req.body.password, 10);
       let sql = `INSERT INTO users(username, password) VALUES (?, ?)`;
       db.run(sql, [req.body.username, hash], () => {});
       res.end();
   });
   
   app.listen(3000)

If we run our app using ``node app.js`` or ``nodemon app.js`` and send an http post request to it with username and password keys set to our chosen values they will be stored in our database along with an automatically generated value for the `id` field. Here is the request:

.. code::

   curl -d "username=Steve&password=secret" -X POST http://localhost:3000/register

The -d (--data) option in the `cURL` request causes the specified data to be sent as a POST request. By default when `cURL` makes an http post request it will include a header called `Content-Type` with a value of `application/x-www-form-urlencoded`. We could use the -H (--header) option to specify this explicitly: ``-H "Content-Type: application/x-www-form-urlencoded"``. The path of `/register` appended to the domain, `localhost:3000`, used in our `cURL` request causes the route handler function we have written to be invoked with the posted data. If we now check the contents of our `users` table we can see a row has been added for the newly registered user with appropriate values in the `id`, `username` and `password` fields.

.. code::

   steve@Dell ~/Desktop/my-app $ sqlite3 my-app.db 
   SQLite version 3.11.0 2016-02-15 17:29:24
   Enter ".help" for usage hints.
   sqlite> select * from users;
   5|Steve|$2b$10$xikSVmyZoG4p3qM1wSCopOCBM7qGT0RkaSsVQLwtMGflgwW8gGFDG
   sqlite> 

We can see the row for the user with `username` of Steve has an `id` value of 5. Generally SQLite will start at 1 and and simply increment by 1 for every new row added to the table. In this case the first four rows have been deleted so the first row in the table now has and `id` value of 5. We can also see the value that the `bcrypt` module has placed in the `password` field consisting of the prefix (2b) and work factor (10) followed by the salt and actual bcrypt hash concatenated together.

Login Script
------------

Now that we can register users we will create a password protected home page for our website. The path for the home page will be `'/'`. It will handle login post requests to our app.js file and return the home page if the login is successful or inform the user if they submit an incorrect username or password. The app.js file with the new route handler is shown here:

.. code::

   const express = require('express');
   const bcrypt = require('bcrypt');
   const sqlite3 = require('sqlite3');
   
   const app = express();
   
   const db = new sqlite3.Database('my-app.db');
   
   app.use(express.urlencoded({ extended: true }));
   
   app.post('/register', function(req, res) {
       const hash = bcrypt.hashSync(req.body.password, 10);
       let sql = `INSERT INTO users(username, password) VALUES (?, ?)`;
       db.run(sql, [req.body.username, hash], () => {});
       res.end();
   });

   app.post('/', (req, res) => {
       console.log('You posted to the /login path');
       let sql = `SELECT * FROM users WHERE username = ?`;
       db.get(sql, [req.body.username], function(err, row) {
           if(!row){
               res.send('Invalid Username\n');
           } else {
               if(bcrypt.compareSync(req.body.password, row.password)){
                   res.send(`Hi ${row.username}! Welcome to the website\n`);
               } else {
                   res.send('Invalid Password\n')
               }
           }
       })
   });

   app.listen(3000);

In order to simulate user logins we will use `cURL` to send post requests to our new route. We will send a login with the correct details followed by one with the wrong username and then one with the wrong password:

.. code::

   steve@Dell ~ $ curl -d "username=Steve&password=secret" -X POST http://localhost:8000/
   Hi Steve! Welcome to the website
   steve@Dell ~ $ curl -d "username=Stee&password=secret" -X POST http://localhost:8000/
   Invalid Username
   steve@Dell ~ $ curl -d "username=Steve&password=secet" -X POST http://localhost:8000/
   Invalid Password

A couple of details to point out here are the use of \\n to create a line break so that ``steve@Dell ~ $`` appears on a new line after the content of the http response. The other detail is that the `cURL` request can be made from any directory. It is being made from my home directory in this case.

We now have a system which allows users to login and once logged in their identity is available to the website. We used it to display their username but we could have queried a database for other details relating to them and displayed it. The system we have implemented does not remember that a user is logged in. If the user were to request the same page or another page on the website they would have to log in again which would get tedious. To get round this we can use cookies or JWTs to create an extended logged in state that persists over many requests to the server.

Once we extend the logged in state we can move the login script to its own route (for example /login) and have a handler for it which checks the username and password as before. If the username and password are correct an extended login session can be initiated and the user can be redirected to another page, for example the home page. If the username or password are not correct the user could be redirected back to the login page with a message telling them the problem.
   
Cookie Sessions
---------------

Before any of the routes in our app we can have a procedure which initiates and maintains sessions. This can be done whether or not we have registration and login routes in our code. A session can be initiated by the server when an http request is first made to it. The code running on the server, in our case in app.js, can create a Set-Cookie header in the http response. The value of the Set-Cookie header can be a unique random string called a session id (sid). As well as sending the sid to the browser in the response header the server keeps a copy of the sid on the server. When the browser receives the Set-Cookie header it stores the sid along with the domain that it came from. In subsequent requests to any path on that domain the browser will include a Cookie header in the request. The value of the cookie header will be the sid that it received earlier from that domain. 

A server with the session procedure installed will check an incoming http request to see if it has a Cookie header with a sid in it. If it does then, assuming the browser is behaving as it should, the sid must have originated from that server since browsers should only send Cookie headers to servers with the sid that the server sent to them. However some malicious attacks on servers can be eliminated if the server signs the sid before it sends it out in such a way that on being represented with the sid it can determine that the sid was originated by from that server and not generated elsewhere. So, when the server receives a sid in a request Cookie header and establishes that it generated the sid it keeps that sid and does not generate a new one. The response from the server to the browser will not contain a Set-Cookie header. The browser will still continue to send its stored sid for that domain in any further requests to the server on that domain.

We now have a situation in which the same sid is being passed to the server every time a particular browser makes an http request to the server. The server has kept a copy of the sid and checks the incoming copy from the browser to see that it originated from the server and not elswhere.

In order to turn this session into a login session we need to arrange for the sid kept by the server to be associated with the identity of the user when they login with their username and password. A session store on the server does this. The session store is essentially a table with rows corresponding to users. A minimal implementation only requires two colums: one for the sid and the other for the user id. Memory stores can be held in RAM or on disc on the server.

An alternative implementation which is now less popular and may be less secure is for the server to only store the sid. The identity of the user is appended to the copy of the sid sent to the browser. Now every time the browser makes a request it is sending the sid and the user id to the server. On receiving the sid with user id the server accepts that the user is logged in because it sent the sid with user id attached as a result of successful login. Encryption methods can be used to prevent user ids being attached to sids and then sent to the server as an attempt to fraudently login into the server.

To use sessions in our app we will install the `express-session` module, require it and assign it to a variable called session. By including it as an argument to the app.use() function it will be invoked every time the server is called. Also, any routes we make for the app will be added below the app.use(session) function so that the session procedure always runs first before any routes are called.

.. code::

   npm install express-session

.. code::

   const express = require('express');
   const session = require('express-session');
   
   const app = express();
   
   app.use(session({
       secret: 'keyboard cat'
   }));
   
   app.get('/', function(req, res, next){
       res.send('Hallo World!\n');
   });
   
   app.listen(8000)

The registration and login routes from app.js have been removed and a simple home page at / added which outputs 'Hallo World!'. The session function used as an argument in app.use() can take many options as arguments. The only necessary option is secret. The value given to secret should be a string that is unique to this app. This string is used in the encryption process that generates the sid and is necessary for `express-session` to identfiy that sids were originated by this app.

We can now send an http get request to the / path using curl. We will use the -v (--verbose) option so that we can see details of the http request to the server and the http response from the server:

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
   < Content-Length: 13
   < ETag: W/"d-avgnGx3K89zMI8eAqzV3j2CUeQI"
   < set-cookie: connect.sid=s%3AR50pbSRvZiF2kUpEyJKWbcvaQTKgZn0C.pedlv81uwHReaVvWudO69d%2Fo7Od6g3ImbaJCA%2FpkiTA; Path=/; HttpOnly
   < Date: Sun, 20 Jan 2019 21:34:11 GMT
   < Connection: keep-alive
   <
   Hallo World!
   * Connection #0 to host localhost left intact
   steve@Dell ~ $

The output from the curl http get request shows request information prefixed with > and response information prefixed with <. We can see that the value of the set-cookie response header is connect.sid=s%3AR50p....etc.etc... This is the unique sid generated by `express-session` in our app.js code. If we send the same http request again we would get a similar response but the sid would be different. This is because, unlike the browser, `cURL` does not by default send a cookie request header with a sid in it. So, the server, seeing there is not a sid cookie in the request generates a new sid and returns this to the browser in a set-cookie header. We can instruct `cURL` to store the sid cookie in the set-cookie header using the -c (--cookie-jar) option. This option followed by the name of a file tells `cURL` to store the sid in the specified file. Then if `cURL` is invoked with the -b (--cookie) option followed by the file name we used to store the cookie in, the request will have a cookie header with the sid in it. We can see the result of making a request with the -c flag here:

.. code::

   steve@Dell ~ $ curl http://localhost:8000 -v -c cookie-jar.txt
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
   < Content-Length: 13
   < ETag: W/"d-avgnGx3K89zMI8eAqzV3j2CUeQI"
   * Added cookie connect.sid="s%3AMyMY6V-jNwRmTzueO6cJ2AcZlFpo4UvN.SVrJpRRrN9a4t9GsZTUo829IJDiLm9zdP%2FbCmplOJVI" for domain localhost, path /, expire 0
   < set-cookie: connect.sid=s%3AMyMY6V-jNwRmTzueO6cJ2AcZlFpo4UvN.SVrJpRRrN9a4t9GsZTUo829IJDiLm9zdP%2FbCmplOJVI; Path=/; HttpOnly
   < Date: Sun, 20 Jan 2019 22:09:55 GMT
   < Connection: keep-alive
   <
   Hallo World!
   * Connection #0 to host localhost left intact
   steve@Dell ~ $

The result of this request is similar to the first request except that it additionally tells us that it added the cookie (ie stored it). Also, as explained above a new sid has been generated. If we now make the same request except with the -b (--cookie) option a cookie response header with this sid in it will be sent to the server:

.. code::

   steve@Dell ~ $ curl http://localhost:8000 -v -b cookie-jar.txt
   * Rebuilt URL to: http://localhost:8000/
   *   Trying 127.0.0.1...
   * Connected to localhost (127.0.0.1) port 8000 (#0)
   > GET / HTTP/1.1
   > Host: localhost:8000
   > User-Agent: curl/7.47.0
   > Accept: */*
   > Cookie: connect.sid=s%3AMyMY6V-jNwRmTzueO6cJ2AcZlFpo4UvN.SVrJpRRrN9a4t9GsZTUo829IJDiLm9zdP%2FbCmplOJVI
   >
   < HTTP/1.1 200 OK
   < X-Powered-By: Express
   < Content-Type: text/html; charset=utf-8
   < Content-Length: 13
   < ETag: W/"d-avgnGx3K89zMI8eAqzV3j2CUeQI"
   < Date: Sun, 20 Jan 2019 22:16:25 GMT
   < Connection: keep-alive
   <
   Hallo World!
   * Connection #0 to host localhost left intact
   steve@Dell ~ $

In the output above we can see that the same sid that was sent in the previous response and which we stored in the `cookie-jar.txt` file is now being sent in the Cookie request header. Because a Cookie with a sid was sent to the server it does not send a set-cookie response header back. It is the job of the browser to persist the session by sending the cookie header in any further requests to that domain.

When the `express-session` code runs, in addition to what has already been described, it also creates a session object. This is created as a property of the `express` request object. So, it can be accessed by req.session in our code. We can see this by adding ``console.log(req.session);`` to the route handler for the home page:

.. code::

   const express = require('express');
   const session = require('express-session');
   
   const app = express();
   
   app.use(session({
       secret: 'keyboard cat'
   }));
   
   app.get('/', function(req, res, next){
       console.log(req.session);
       res.send('Hallo World!\n');
   });
   
   app.listen(8000)

Now when we send an http get request to the home page with curl we see the session object displayed in the console that is running the server. First the `cURL` command and 'Hallo World!' response:

.. code::

   steve@Dell ~ $ curl http://localhost:3000
   Hallo World!

Next the output in the console running the app.js server:

.. code::

   Session {
     cookie:
      { path: '/',
        _expires: null,
        originalMaxAge: null,
        httpOnly: true } }

This session object can be read from and written to by our code. We can see this by creating an app.use() function in our app.js which adds a userId key with a value in it to the session object:

.. code::

   const express = require('express');
   const session = require('express-session');
   
   const app = express();
   
   app.use(session({
       secret: 'keyboard cat'
   }));
   
   app.use(function(req, res, next) {
       req.session.userId = 'Steve';
       next();
   });
   
   app.get('/', function(req, res, next){
       console.log(req.session);
       res.send('Hallo World!\n');
   });
   
   app.listen(3000)

Now when we run the same `cURL` request we get the modified session object output in the console:

.. code::

   Session {
     cookie:
      { path: '/',
        _expires: null,
        originalMaxAge: null,
        httpOnly: true },
     userId: 'Steve' }

The session object with its modifications is stored on the server with its corresponding sid. So, when a request with a cookie header containing a sid is made to the server the server will get the session object corresponding to that sid from memory (RAM or disc) and use it in preparing the http response it sends to the browser. In the login script we are going to write a `userId` property will be created on the session object and set to the id of the user taken from the `users` table. The `userId` will be an integer not text as we used above to demonstrate that we can modify the session object.

It would be possible to use the username instead of the user's id and so our login system would only require username and password to work. One reason not to do this is that looking up data in a table tends to be faster using integers than text. Although at login we have to look up the username we can use the user's id (an integer) for any subsequent data queries. For a complex website such as banking software there maybe many database queries necessary before sending the response to the browser.

App from Scratch
----------------

We will create an app from scratch with registration, login and different homepages for logged in and non-logged in users. The homepage for logged in users will be personalised. First create a new directory for the app and change directory into it and then initiate the npm system and install the necessary npm modules:

.. code::

   steve@Dell ~ $ mkdir my-app
   steve@Dell ~ $ cd my-app
   steve@Dell ~/my-app $ npm init -y
   steve@Dell ~/my-app $ npm install express
   steve@Dell ~/my-app $ npm install express-session
   steve@Dell ~/my-app $ npm install bcrypt
   steve@Dell ~/my-app $ npm install sqlite3

Next make the SQLite database with a `users` table in it:

.. code::

   steve@Dell ~/my-app $ sqlite3 my-app.db
   SQLite version 3.11.0 2016-02-15 17:29:24
   Enter ".help" for usage hints.
   sqlite> CREATE TABLE users (
      ...> id INTEGER PRIMARY KEY,
      ...> username TEXT,
      ...> password TEXT
      ...> );
   sqlite>

Next create app.js (``vim app.js``) and write the code for the register route:

.. code::

   const express = require('express');
   const bcrypt = require('bcrypt');
   const sqlite3 = require('sqlite3');
   
   const app = express();
   
   const db = new sqlite3.Database('my-app.db');
   
   app.use(express.urlencoded({ extended: true }));
   
   app.post('/register', function(req, res) {
       const hash = bcrypt.hashSync(req.body.password, 10);
       let sql = `INSERT INTO users(username, password) VALUES (?, ?)`;
       db.run(sql, [req.body.username, hash], () => {});
       res.end();
   });
   
   app.listen(3000)

Next open a new terminal, change directory into `my-app` and run ``nodemon app.js``

Next test the registration code with `cURL`. We will put the curl command in a bash (`.sh`) file so that as the testing becomes more complex to handle the full registration and login procedure we can run a series of curl commands by running a single bash script. Using a text editor we create `curl-test.sh` and put the following code in it:

.. code::

   #!/bin/bash
   USERNAME=$1
   PASSWORD=$2
   curl -d "username=${USERNAME}&password=${PASSWORD}" -X POST http://localhost:3000/register

Next run this script providing username, Jack, and password, 1234, as arguments to the bash script:

.. code::

   bash curl-test.sh Jack 1234

.. code::

   steve@Dell ~/Desktop/my-app $ sqlite3 my-app.db
   SQLite version 3.11.0 2016-02-15 17:29:24
   Enter ".help" for usage hints.
   sqlite> SELECT * FROM users;
   1|fred|$2b$10$.YfhD7MGMaiSJDcHffj64O9bWhfJJCldoRQkJnrgsMRJ4o51RFmO6
   3|Matt|$2b$10$PLrs3GcBm3anAFR8a5v7HOCLWgjdowOPyoug.ykP6QY7xE7GPT5cS
   5|Steve|$2b$10$xikSVmyZoG4p3qM1wSCopOCBM7qGT0RkaSsVQLwtMGflgwW8gGFDG
   7|Jack|$2b$10$SnXhQbfSJCXNmE5V12WntOCDW/oVdBZwd2rHcj9Pw3WMkb.EmBRZW
   sqlite>

Next add the kitchen sink to app.js:

.. code::

   app.use(express.urlencoded({ extended: true }));
   
   app.use(session({
       secret: 'keyboard cat'
   }));
   
   app.get('/register', function(req, res){
       res.send('This page will have the Register Form');
   });
   
   app.post('/register', function(req, res) {
       const hash = bcrypt.hashSync(req.body.password, 10);
       let sql = `INSERT INTO users(username, password) VALUES (?, ?)`;
       db.run(sql, [req.body.username, hash]);
       res.end();
   });
   
   app.get('/unregister', function(req, res) {
       res.send('This page will have the Unregister Form')
   });
   
   app.delete('/unregister', function(req, res){
       // get them to confirm their password first.
       let sql = `DELETE FROM users WHERE id = req.session.userId`;
       db.run(sql, [req.session.userId]);
       req.session.userId = undefined;
       res.redirect('/');
   });
   
   app.get('/login', function(req, res){
       res.send('This page will have the Login Form');
   });
   
   app.post('/login', (req, res) => {
       let sql = `SELECT * FROM users WHERE username = ?`;
       db.get(sql, [req.body.username], function(err, row) {
           if(!row){
               console.log('Invalid Username');
               res.redirect('/login');
           } else {
               if(bcrypt.compareSync(req.body.password, row.password)){
                   req.session.userId = row.id;
                   console.log('You are logged in');
                   console.log(req.session);
                   res.redirect('/');
               } else {
                   console.log('Incorrect Password');
                   res.redirect('/login');
               }
           }
       })
   });
   
   app.post('/logout', function(req, res){
       req.session.userId = undefined;
       app.redirect('/');
   });
   
   app.get('/', function(req, res, next){
       res.send('This is the home page');
   });
   
   app.listen(3000)

Json Web Tokens
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
