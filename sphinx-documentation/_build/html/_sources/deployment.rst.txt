:doc:`Home </index>`

Deploy Using Github and Heroku
==============================

While building and maintaining a `node-express` app one can use `git` to keep backups of the app in a repository on `Github`. This repo can automatically update the site if it is hosted at `Heroku`.

Clone a Github Repository
-------------------------

If you (or someone else) has a `node-express` app in a Github repository then a copy of it can be cloned onto your computer:

.. code::

   $ git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY

Then `cd` into the newly created `YOUR-REPOSITORY` directory and run: ``npm install``. Now the app will work and can be run locally and viewed in a browser.

If the site is edited locally, the edits can be committed using git and then pushed to the repo on Github to update it. The work flow is:

.. code::

   // edit files
   
   git add.

   git commit -m "Say what you did"

   git push origin master

Now the edits that were made will be on `Github` and deployed on `Heroku`.

Deploying This Documentation
----------------------------

An express app was created with the Express Application Generator and a directory called sphinx-documentation created in the root directory of this app. `Sphinx` was used inside this directory to write reStructuredText files which are given an `rst` file extension (for example `index.rst` or `deployment.rst`. With `Sphinx` installed these files can be converted into html files using the command ``make html``. These html files are generated in a directory called `html` within a directory called `_build` insdie the `sphinx-documentaion` directory. In `app.js` I the following express static middleware pattern is used:


.. code::

   app.use(express.static(path.join(__dirname, 'sphinx-documentation/_build/html')));
   
Note that I also have the standard express static middleware pattern created by the Express Application Generator for serving static assests such as javascript, css and images for other routes provided by the app:
.. code::

   app.use(express.static(path.join(__dirname, 'sphinx-documentation/_build/html')));

The app is under git version control (it has `.git` and `.gitignore` in the root directory). The contents of the `express-with-steve` directory is pushed to www.github.com/stevespages/express-with-steve. An app called `express-with-steve` was created at `heroku` and linked to the github repo referred to above. So, when changes to the sphinx documentation are made and pushed to github they update the heroku website.

From the heroku cli or web dashboard one needs to set up a link to the github page. Also the app needs a Procfile with the instruction to start the app such as `web: node app.js`

The root route ('/') serves the sphinx generated documentation for the site. Other routes are used for the Code Examples. Thes make use of the express.Router() class. The code for them is in javascript files in the routes directory which may use pug files in the views directory and static assests (such as images, css and javascript (for the browser)) in the public directory.

Major Changes
-------------

This website was originally created as an ordinary Express app. I then moved the content into a newly created Express Application Generator app. This worked locally but when I pushed the changed app to github the heroku hosted version of the site crashed. Initially I got an H10 Heroku error which turned out to be due to the fact I had not changed the contents of the Procfile. This was `web: node app.js` which was correct for starting an ordinary Express app but not an Express ApplicationGenerator app. I changed the Procfile contents to `web: node bin/www`. Now I was getting an H14 error. This was solved by restarting the dyno using the heroku cli on my computer: `steve@Dell:~$ heroku ps:scale web=1 -a express-with-steve`. Now the app displays in the browser properly when served from Heroku.


