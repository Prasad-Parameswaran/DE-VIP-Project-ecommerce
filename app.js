const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const session = require("express-session");
const multer = require("multer")
const indexRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const app = express();
const handlebars = require("handlebars")
const nocache = require("nocache");
require('./config/connection');


app.use(nocache());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: "prasad",
  saveUninitialized: false,
  cookie: { maxAge: 2000000000 },
  resave: false,
}));

app.engine('hbs', hbs.engine({
  extname: '.hbs',
  defaultLayout: 'layout',
  layoutDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials')
}));

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use("/images", express.static(path.join(__dirname, 'images')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('users/error');
});

handlebars.registerHelper('addOne', function (index) {
  return index + 1;
});

handlebars.registerHelper('unlessEqual', function (value1, value2, options) {
  if (value1 !== value2) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
})
handlebars.registerHelper('Equal', function (value1, value2, options) {
  if (value1 === value2) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
})

handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('calcProfit', function (totalPrice) {
  return Math.round((totalPrice * 10) / 100);
}
)

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

