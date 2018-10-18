const express = require('express');
const app = express();

const morgan = require('morgan');

const path = require('path');
const routes = require('./routes/index');
const users = require('./routes/users');

app.use('/', routes);
app.use('/users', users);

app.use(morgan('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//server
const server = app.listen(3000, function () {
  const host = server.address().address
  const port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
});