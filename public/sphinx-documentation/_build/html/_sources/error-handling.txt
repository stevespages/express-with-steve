:doc:`Home </index>`

Error Handling
==============

The `db.get()` function used here has two arguments. The first is the sql query that it should run on the database it is connected to. The second argument is a callback function that the developer can write to make use of the result of the query to the database. We chose to write a function which sends the result to the browser. The function the devloper supplies should have two arguments here called `err` and `row`. The query result supplied to our callback function has two parts. The first is the error value and the second is the result value. If there is no error the first part of the result will be null and the second part will have data from the query. If there was an error the first part will have a description of the error and the second, result, part will be null. This enables the result to be processed on success and an error to be generated on failure of the query.

