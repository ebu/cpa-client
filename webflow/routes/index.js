"use strict";

var http    = require('http');
var request = require('request');

var db      = require('../models');
var config  = require('../config');


module.exports = function(app) {

  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  app.get('/me', function(req, res) {
    if (!req.user) {
      res.redirect('/?login_required');
      return;
    }

    db.User
      .find({
        id: req.user.id
      })
      .success(function(user) {
        user.getTokens().success(function(tokens) {
          res.render('me.ejs', { user: req.user, tokens: tokens });
        });
      });
  });

  app.get('/test', function(req, res) {
    if (!req.user) {
      res.redirect('/me');
      return;
    }

    res.send("ok: " + JSON.stringify(req.user));
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
