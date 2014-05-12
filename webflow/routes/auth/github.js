"use strict";

var config  = require('../../config');
var db      = require('../../models');

var passport       = require('passport');
var GitHubStrategy = require('passport-github').Strategy;


passport.use(new GitHubStrategy({
    clientID: config.identity_providers.github.client_id,
    clientSecret: config.identity_providers.github.client_secret,
    callbackURL: config.identity_providers.github.callback
  },
  function(accessToken, refreshToken, profile, done) {
    db.User.findOrCreate({
        provider_uid: profile.id,
        username: profile.displayName
      })
      .success(function(user) {
        done(null, user);
      })
      .error(function(err) {
        done(err, null);
      });
  }
));


module.exports = function(app) {

  app.get('/auth/github', passport.authenticate('github'));

  app.get('/auth/github/callback',
    passport.authenticate('github', {
      successRedirect: '/me?success',
      failureRedirect: '/?error=login_failed'
    }));

};
