"use strict";

var db = require('../models');

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  app.put('/user', function(req, res) {
    db.User
      .create({
        username: req.body.username
      })
      .complete(function(err, user) {
        if (err) {
          res.send(500);
        }
        else {
          res.send(200, user);
        }
      });
  });
};
