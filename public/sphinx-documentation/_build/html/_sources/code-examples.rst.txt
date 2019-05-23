:doc:`Home </index>`

Code Examples
=============

The code examples each have a link to the result of the code called web and a link to the code itself hosted at github called git. If applicable there is also a link to the pug file that generates the html.

You may also want to see the app.js_ file.

.. _app.js: https://raw.githubusercontent.com/stevespages/express-with-steve/master/app.js

The full code for express-with-steve_ is also available on github.

.. _express-with-steve: https://github/stevespages/express-with-steve

different-route
---------------

web: different-route_

.. _different-route: ./different-route

source: https://raw.githubusercontent.com/stevespages/express-with-steve/master/routes/different-route.js

This shows a minimal implementation of a route using the express.Router class

mailer
------

web (no link given as the program as written enables unlimeted numbers of emails to be sent from my gmail account which would be undesirable!)

git (no link to the code is given as currently it contains my gmail username and password. These need to be passed to the program as environment variables on the Heroku server and also on my local server so that they can be omitted from the code that is stored in this site's git repository)

This shows how the mailer npm module can be used to send an email from a gmail account from within an express app.

env-var
-------

web: env-var_

.. _env-var: ./env-var

source: https://raw.githubusercontent.com/stevespages/express-with-steve/master/routes/env-var.js

This shows how environment variables can be supplied to a node express app and used from within the app. This can be preferable to hardcoding them and risking them being exposed (for example on git) to malicious users. If you follow the web link for this code example you will only see something in the browser if the server was supplied with an environment variable called MY_ENV_VAR when it was started. Follow the git link above to see how this can be done.

mailer
------

web: mailer_

.. _mailer: ./mailer

source: https://raw.githubusercontent.com/stevespages/express-with-steve/master/routes/mailer.js

npm install mailer

This demonstrates use of the mailer module to send an email. A password is required for the email account that the email is sent from. It would be insecure to supply hardcode this in the programme and then store it in a public repository such as the one I have on github. So I set an environment variable, GMAIL_PASSWORD, when I start the server and access this from within node using process.env.GMAIL_PASSWORD. I am unlikely to start the Heroku (production) server with the required environment variable (although I might!) so it probably won't work. Run locally I may start the server with the environment variable and so it should work then.

