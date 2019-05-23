const express = require('express');
const path = require('path');

// Importing the code from the Code Examples. Each one is a file in the routes directory
const differentRouteRouter = require('./routes/different-route');
const envVarRouter = require('./routes/env-var');

// Heroku will assign a environment variable called PORT.
// If there is no environment variable called PORT then PORT will be assigned the value of 8000
const PORT = process.env.PORT || 8000;

const app = express()

// Middlewares for using the code from the Code Examples
app.use('/different-route', differentRouteRouter);
app.use('/env-var', envVarRouter);

// this middleware serves the html files generated by sphinx from the rst files in the sphinx-documentation directory
app.use(express.static(path.join(__dirname, 'public/sphinx-documentation/_build/html')));

app.listen(PORT, () => {
	console.log(`listening on ${PORT}`);
});
