"use strict";

var db = require('../models');
var config = require('../config');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

passport.use(new GitHubStrategy({
    clientID: config.identity_providers.github.client_id,
    clientSecret:  config.identity_providers.github.client_secret,
    callbackURL: "http://local.ebu.io:8000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    db.User.findOrCreate({ provider_uid: profile.id, username: profile.displayName }).success(function(user){
      return done(null, user);
    }).error(function(err) {
      console.log('error');
      done(err, null);
    });
  }
));

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


  //Github
  app.get('/auth/github',
    passport.authenticate('github'));


  app.get('/auth/github/callback',
    passport.authenticate('github', {
      successRedirect: '/me',
      failureRedirect: '/?error=login_failed'
    }));

  app.get('/me',
    function(req, res, next) {

      if(!req.user) {
        res.redirect('/auth/github');
      } else {

        res.render('me.ejs', {user:req.user});
      }
  });




};
