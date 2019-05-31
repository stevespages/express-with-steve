var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Importing the code from the Code Examples. Each one is a file in the routes directory
const differentRouteRouter = require('./routes/different-route');
const envVarRouter = require('./routes/env-var');
const mailerRouter= require('./routes/mailer');
const externalJavascriptRouter = require('./routes/external-javascript');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')))

// comment out the root path so requests to the root fall through to the express.static middleware resulting in the sphinx documentation being served
// app.use('/', indexRouter);
// comment out /users route as I am not using it
// app.use('/users', usersRouter);

// middlewares for the code examples
app.use('/different-route', differentRouteRouter);
app.use('/env-var', envVarRouter);
app.use('/mailer', mailerRouter);
app.use('/external-javascript', externalJavascriptRouter);

// this serves the html files generated by sphinx
app.use(express.static(path.join(__dirname, 'sphinx-documentation/_build/html')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
