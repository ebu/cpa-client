"use strict";

/**
 * Module dependencies.
 */

var express = require('express');
var path    = require('path');
var winston = require('winston');
var passport = require('passport');

var config = require('../config.js');
var db     = require('../models');

// Server
var app = express();
app.set('port', process.env.PORT || 3000);

// Templates
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

// Config
app.set('config', config);

// Logging
var logger;

if (process.env.NODE_ENV !== "test") {
  logger = require('./logger');
}
else {
  logger = require('./null-logger');
}

// Set up express web server logging via winston, but don't enable logging
// when running unit tests.

app.set('logger', logger);

if (process.env.NODE_ENV !== "test") {
  var stream = {
    write: function(message, encoding) {
      return logger.info(message.trimRight());
    }
  };

  app.use(express.logger({ stream: stream, format: 'dev' }));
}

app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());

// Passport
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'LKASDMjnr234n90lasndfsadf123' }));
app.use(passport.initialize());
app.use(passport.session());

// Init passport
passport.serializeUser(function(user, done) {
  console.log('serialize user:'+user.id);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.User.find({id:id}).success(function(user) {
      done(null, user);
    },
    function(error) {
      done(error, null);
    });
});


// Routes
app.use(app.router);
app.use(express.static(path.join(__dirname, '..', 'public')));

require('../routes/status')(app);
require('../routes/index')(app);

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

db.sequelize
  .authenticate()
  .complete(function(err) {
    if (err) {
      logger.error('Unable to connect to the database.');
    }
    else {
      if (process.env.NODE_ENV !== 'test') {
        logger.info('Database connection has been established successfully.');
      }
    }
  });

app.on('listening', function() {
  logger.info('Express server listening on port ' + app.get('port'));
});

module.exports = app;
