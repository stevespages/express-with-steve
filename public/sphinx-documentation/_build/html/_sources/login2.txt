.. raw:: html

   <embed>
      <style>
         body {
            background-color: pink;
         }
      </style>
   </embed>

:doc:`Home </index>`

Login2
======

Overview
--------

It is very often important for the response from a website to be tailored to the particular person who requested that response. In order to do this the server side script generating the response needs to have access to the identity of the user and what that user is authorized to access. Some websites may have several levels of authorization. Non logged in users can see some material while logged in ordinary users can additionally see password protected material and logged in administrators can edit material on the website. An overview of a typical implementation of a simple login system is given below.

On initial registration the user supplies a username and password which is stored in a database on the server. The database will generate a unique user id for each user. Other information supplied by the user at registration or on later visits to the website may also be stored. Also information such as the date and time the user registered may be stored if it is likely to be useful. So after registration there will be a row in a `users` table corresponding to that user. The three columns (often called fields) of interest to the login mechanism are the `user id`, `username`, and `password`. The username is often the email address of the user and a verification step can be introduced involving sending an email to the user asking them to click a link if they want to register with the website. At its simplest a registered user consists of a single row in a `users` table with the three columns referred to above in it.

When the user wants to login to the website they submit a form which posts a request to the website with their username and password. The server looks in the `users` table for a row in which the username matches the username given in the login form. It then extracts the password from that row and compares it with the password supplied by the user in the login form. If the passwords match the server then extracts the `user id` from the same row in the table and assigns it to a program variable which can be accessed from any part of the code that provides the website's functionality. That program variable can provide two pieces of information. The first is the fact that it has been assigned a value. This indicates that a user is logged in and could be used to decide whether or not to display material that should not be available to non logged in users but which can be viewed by all logged in users. If the variable has not been assigned a value then the program knows that the user of the website is not logged in. The second piece of information the variable provides is the `user id` that was assigned to it. This can enable the program to fetch material specific to that user, for example from a database, and display it to them.

The system described above would need the user to login to every page they visited on the website because there is no mechanism to remember that they are logged in. Every time they make a request for a page the server treats them as if they are a new unknown user. In order for the login to persist for a number of requests to the same site the server can send a unique string of characters to the users computer and keep a copy of that unique string together with the user's `user id`. When the browser makes requests to the same website (the same domain) it will include this unique string in its request. The server will compare the string with all the strings it has sent out (each one represents a different user) and select the one that matches it and extract the `user id` associated with it. It will put this into the program variable discussed in the previous paragraph thereby reinstating the logged in state for that particular user. The unique string here will either be a session cookie or part of a session cookie or part of a JSON Web Token (JWT).

We now have an outline description of how a login session might work. In order to obtain a more complete picture we need to consider mechanisms to encrypt the passwords, how the Hyper Text Transfer Protocol (HTTP) works and how cookie sessions and JWT work. 

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

HTTP
----

https://www.webnots.com/seo-tools/http-header-checker

cURL
....

Registration Script
-------------------

Login Script
------------

Cookie Sessions
---------------

Json Web Tokens
---------------
