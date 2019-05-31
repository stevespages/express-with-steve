:doc:`Home </index>`

Code Examples
=============

The code examples each have a link to see what the code does in a browser. There is also a link to the code itself hosted at github. There are also links to other relevant files such as javascript and pug files for some of the examples.

You may also want to see the app.js_ file.

.. _app.js: https://raw.githubusercontent.com/stevespages/express-with-steve/master/app.js

The full code for express-with-steve_ is also available on github.

.. _express-with-steve: https://github.com/stevespages/express-with-steve

different-route
---------------

different-route_

.. _different-route: ./different-route

https://raw.githubusercontent.com/stevespages/express-with-steve/master/routes/different-route.js

This shows a minimal implementation of a route using the express.Router class

env-var
-------

env-var_

.. _env-var: ./env-var

https://raw.githubusercontent.com/stevespages/express-with-steve/master/routes/env-var.js

This shows how environment variables can be supplied to a node express app and used from within the app. This can be preferable to hardcoding them and risking them being exposed (for example on git) to malicious users. If you follow the web link for this code example you will only see something in the browser if the server was supplied with an environment variable called MY_ENV_VAR when it was started. Follow the git link above to see how this can be done.

mailer
------

mailer_

.. _mailer: ./mailer

https://raw.githubusercontent.com/stevespages/express-with-steve/master/routes/mailer.js

npm modules: mailer

This demonstrates use of the mailer module to send an email. A password is required for the email account that the email is sent from. It would be insecure to hardcode this in the programme and then store it in a public repository such as the one I have on github. So I set an environment variable, GMAIL_PASSWORD, when I start the server and access this from within node using process.env.GMAIL_PASSWORD. I am unlikely to start the Heroku (production) server with the required environment variable (although I might!) so it probably won't send an email. Run locally I may start the server with the environment variable and so it should work then.

external-javascript
-------------------

external-javascript_

.. _external-javascript: ./external-javascript

https://raw.githubusercontent.com/stevespages/express-with-steve/master/routes/external-javascript.js

https://raw.githubusercontent.com/stevespages/express-with-steve/master/views/external-javascript.pug

https://raw.githubusercontent.com/stevespages/express-with-steve/master/public/javascripts/external-javascript.js

This demonstrates importing a javascript file into a pug file. Express application generator generates a public directory for serving static files. It puts three directories in there one of which is called javascripts. In this code example we put a file called my-functions.js in this javascripts directory. Application generator also creates a views directory with three files in it. These are errors.pug, layout.pug and index.pug

multer
------

multer_

.. _multer: ./multer

https://raw.githubusercontent.com/stevespages/express-with-steve/master/routes/multer.js

https://raw.githubusercontent.com/stevespages/express-with-steve/master/views/multer.pug

npm modules: multer

A directory called `multer-uploads` was created in the `public` directory for uploads to be stored in.

multer-2-files
--------------

multer-2-files_

.. _multer-2-files: ./multer-2-files

https://raw.githubusercontent.com/stevespages/express-with-steve/master/routes/multer-2-files.js

https://raw.githubusercontent.com/stevespages/express-with-steve/master/views/multer-2-files.pug

npm modules: multer

A directory called `multer-uploads` was created in the `public` directory for uploads to be stored in.

login
-----

login_

.. _login: ./login

https://raw.githubusercontent.com/stevespages/express-with-steve/master/routes/login.js

https://raw.githubusercontent.com/stevespages/express-with-steve/master/views/login.pug

This login system has no provision for registration or changing password or forgot password? On navigating to /login a session is initiated. If the user is not logged in they see a login form. If the user is logged in they see a logout link. So, they can log in and logout in sequence indefinitely...
