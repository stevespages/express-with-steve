:doc:`Home </index>`

Code Examples
=============

The code examples each have a link to the result of the code called web and a link to the code itself hosted at github called git. If applicable there is also a link to the pug file that generates the html.

You may also want to see the app.js_ file

.. _app.js: https://raw.githubusercontent.com/stevespages/express-with-steve/master/app.js

different-route
---------------

web_

.. _web: ./different-route

git_

.. _git: https://raw.githubusercontent.com/stevespages/express-with-steve/master/routes/different-route.j

This shows a minimal implementation of a route using the express.Router class

mailer
------

This shows how the mailer npm module can be used to send an email from a gmail account from an express app.

env-var
-------

This shows how environment variables can be supplied to a node express app and used from within the app. This can be preferable to hardcoding them and risking them being exposed (for example on git) to malicious users.
