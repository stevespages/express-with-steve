:doc:`Home </index>`

File Structure
==============

If we wrote all the code for our app in the `app.js` file it would be inconvenient. We can use the `Express` routing system to create a more convenient file structure for our app. Inside a directory call `routes` we can create a file with a name that reflects the part of the website the file deals with. For example we could call it `catalog.js` if it contains code dealing with a library catalog. Inside our `app.js` file we need to require and use this new file:

.. code::

   // app.js
   
   const express = require('express');
   const catalogRouter = require('./routes/catalog');
   
   const app = express();
   
   app.use('/catalog', catalogRouter);
   
   app.get('/', function(req, res, next){
           res.send('Hello World!');
   });
   
   app.listen(3000);

Inside `routes/catalog.js` we should have:

.. code::

   // routes/catalog.js
   
   const express = require('express');
   const router = express.Router();
   router.get('/', function(req, res, next){
           res.send('This is the catalog section of the website');
   });
   module.exports = router;

Now if we go to `localhost:3000/catalog` in the browser we will see `This is the catalog section of the website`.

In this case the route handler function is very simple. If there were many different routes in  `routes/catalog.js` and if their route handler functions were quite complicated then the file could get large and confusing. So, the handler functions can be put in a seperate file. According to the MVC pattern we might create a directory called `controllers`. We would then put a file in it called, for example, `bookController.js`. This would have a series of `exports` statements for each of the route handlers. Because the route handler we used is the root ('/') we might call it `index`. So, we would have in `controllers/bookController.js`:

.. code::

   // controllers/bookController.js
   
   exports.index = function(req, res, next){
      res.send('This is the catalog section of the website');
   });

We would now change  `routes/catalog.js` to:

..code::

   // routes/catalog.js
   
   const express = require('express');
   const router = express.Router();
   const book_controller = require('./controllers/bookController');
   router.get('/', book_controller.index);
   });
   module.exports = router;

A large website might have a number of sections each with its own `js` file in the `routes` directory and its own `js` file in the `controllers` directory. The `app.js` file will require the `js` files (modules) from the `routes` directory and these will require the `js` files from the `controllers` directory. The `app.js` file will also determine what prefix is needed in the browser pathname to navigate to these routes. In the example above in `app.js` we had ``app.use('/catalog', catalogRouter);``. So, `/catalog` will be appended to the domain name of the website to get to the routes in `catalogRouter`. The remainder of the pathname (which is absent in the example we gave above as we used '/'. If we had used '/fred' then to get to that route we would need to append `/catalog/fred` to the domain name for the site.
