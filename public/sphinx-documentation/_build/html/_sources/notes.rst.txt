
Notes
,,,,,

*  The Express Application Generator generates: var express = require('express'); Check this: still using var? semicolon? The Express Hello world example: const express = require('express' 4.16.4 ) with no semicolon. Is there any significance to these discrepancies? When I tried to run the version ($ node app.js) with 4.16.4 it threw an error. I removed 4.16.4 so I just had 'express' as argument to require and it worked.

*  The MDN Local Library tutorial uses the async module. For the home page a number of queries to the MongoDB are made to obtain the number or books, authors, genres and bookinstances in the library. It appears that these functionsare supplied in the form of a list (eg. an iterable) as the first argument to async.parallel(). When they have all run the second argument to async.parallel() (the callback function) is run using the results from the list of functions as input on which to act. This second argument (the callback) could send the results of the list of functions to the browser using res.render() for example. How does this pattern relate to the middleware concept of req, res, next()? 

*  Can you do: app.METHOD(PATH, HANDLER_1, HANDLER_2)?

*  The two variable thing: 
   For various reasons it is usually not a good idea to have more than one database query in the same handler function. It is better to chain middleware functions with each having one database query in it. Only the last middleware function can send results to the browser. The problem of scope arises because a variable created in one function will not normally be available in the next one. There seem to be two approaches to solving this. A variable created in one function can be converted into a property of the Request object. So, in our example we could do the following: req.firstName = firstName. Now the value of the firstName variable will be available to all future functions in the middleware chain.

* I can do res.send(req.body) or (errors.array()) and both give a useful output. If I combine them: res.send(req.body + errors.array()) it does not work. If I try and assign both to a variable and then use that ie. res.send(variable) it still fails. It seems to be errors.array() that is the problem. The best I can get when trying to combine it with req.body is [object Object]
