:doc:`Home </index>`

User Input
==========

The value of an input element's name attribute will be accessible from the req object and can be used to persist or display or validate sanitize etc.....

According to express-validator maintainer: "...all methods accessible from the req object are considered legacy" see https://stackoverflow.com/questions/50430625/getting-req-getvalidationresult-is-not-a-function-with-expess-validator and the link from that. "...validationResult(req) is the correct way... [it is] synchronous". So the MDN tutorial is preferred to the example I have given which is taken from an (oherwise) excellent turtorial at https://booker.codes/input-validation-in-express-with-express-validator/

The code shown below displays a simple form in the browser:

.. code::

   const express = require('express')
   const app = express()
   const port =3000
   
   app.get('/example', function (req, res, next) {
     let output = '<form method="post">'
     output += '<input type="text" name="firstName" placeholder="first name">'
     output += '<input type="text" name="lastName" placeholder="last name">'
     output += '<input type="submit" value="submit">'
     res.send(output)
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))

Because the form element does not have an action attribute the form will be sent to the same URL that was used to display it. In this case that is localhost:3000/example. The form element's method attribute is set to post. So, at the moment the app program does not have a route for handling the submitted form. We need to create a new route in our app with the same URL as the existing one but with post not get as the method. This is shown below.

.. code::

   const express = require('express')
   const app = express()
   const port =3000
   
   app.get('/example', function (req, res, next) {
     let output = '<form method="post">'
     output += '<input type="text" name="firstName" placeholder="first name">'
     output += '<input type="text" name="lastName" placeholder="last name">'
     output += '<input type="submit" value="submit">'
     res.send(output)
   })
   
   app.post('/example', function (req, res, next) {
     res.send('Your form has been recieved')
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))

In the example above the route specified as the first argument in the app.post() method (the route is '/example') is matched when the form is submitted causing the function supplied as the second argument to app.post() to be executed. It simply uses the res.send() method to send 'Your form has been recieved' to the browser. A real app would probably use a series of middlware functions to process the data which might include saving it to a database or making a database query using the submitted data to search a database


Validate and Sanitize
---------------------

We want to control the data that is sent to our app from the user. The data can be validated. If the data is not valid, for example a date has been entered using a format that our code will not recognize, the form can be displayed again to the user. This time the various form fields will contain the values the user entered with error messages helping them to alter their input to a form that will validate.

Once a form is submitted which passes the validation stage it may be sanitized. This actually changes the data. It can strip white spaces and escape html code.

Express provides the express-validator module which includes built in validation and sanitization methods as well as enabling custom built methods to be built.

``npm install express-validator``

.. code::

   // This method is deprecated. DO NOT USE!

   const express = require('express')
   const validator = require('express-validator')
   const app = express()
   const port =3000
   
   app.use(express.urlencoded({ extended: false }))
   app.use(validator())
   
   app.get('/example', function (req, res, next) {
     let output = '<form method="post">'
     output += '<input type="text" name="firstName" placeholder="first name">'
     output += '<input type="text" name="lastName" placeholder="last name">'
     output += '<input type="submit" value="submit">'
     res.send(output)
   })
   
   app.post('/example', function (req, res) {
     req.checkBody("firstName", "Enter valid name").isLength({ min: 1 })
     var errors = req.validationErrors()
     if(errors){
       res.send(errors)
       return
     } else {
       res.send('OK' + errors)
     }
   })
   
   app.listen(port, () => console.log(`app listening on port ${port}`))

The code below is similar to the previous example but it conforms more closely to the approach taken in the MDN tutorial and the `express-validator` documentation.

.. code::

   const express = require ('express')
   const bodyParser = require('body-parser')
   const { check, validationResult } = require('express-validator/check')
   const app = express()
   const port = 3000
   
   app.use(bodyParser.urlencoded({ extended: false }))
   
   app.get('/', function (req, res) {
   let output = '<form method="post">'
   output += '<input type="text" name="firstName" placeholder="first name">'
   output += '<input type="text" name="lastName" placeholder="last name">'
   output += '<input type="submit" value="submit">'
   res.send(output)
   })
   
   app.post('/', [check('firstName').isEmail()], function (req, res) {
   const errors = validationResult(req)
   console.log(errors)
   if(!errors.isEmpty()){
   res.send('errors')
   return
   } else {
   res.send('OK')
   }
   })
   
   
   app.listen(port, () => console.log(`listening on port ${port}`))

If the form is submitted with a value for the `firstName` input field less than 1 character long (ie. if nothing is entered into that form element by the user) then the `errors` variable will have a value so `res.send(errors)` will be executed. If the user enters a value in the `firstName` field `errors` will not have a value and so `res.send('OK' + errors)` will be executed

The express middleware function `app.use()` appears twice in the above function. This is an example of Express middleware. If a route is not provided as an argument to `app.use()` then it will run every time an http request is made to the app no matter what route is in the URL. In the code above the order of the `app.use()` statements is important. The body-parser functions need to be executed before the validator functions can be executed.

In order to test and debug post routes you can construct a get route which displays a form (with ``method='post'``). Then fill in the form with values which are chosen to test the post route and then submit the form. The post route will then be called and the resuls displayed in the browser and/or console. This is long winded particularly because once you have sumbitted the form returning to the site elicits a pop up which other than cancel only allows you to resend the data that was submitted previously. To circumvent this you need to type a different url in the address bar, visit that site  and then type the original url. Alternatively,  a new tab can be used to visit the original url. You can use `curl` as a more convenient way to send a post request.

Using curl
----------

To make a curl post request:

.. code::

   curl -d firstName=steve@stevespages.org -d lastName=xyz -d submit=submit localhost:3000

The above request returned OK to the browser since it passed the validation test in the post handler function. When the @ symbol was deleted it returned `errors` because it failed the isEmail() validation test. See https://ec.haxx.se/http-post.html.

Links
.....

https://ec.haxx.se/

