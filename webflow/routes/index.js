"use strict";

var db = require('../models');
var config = require('../config');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var querystring = require('querystring');
var http = require('http');
var request = require('request');

passport.use(new GitHubStrategy({
    clientID: config.identity_providers.github.client_id,
    clientSecret: config.identity_providers.github.client_secret,
    callbackURL: "http://local.ebu.io:8000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    db.User.findOrCreate({ provider_uid: profile.id, username: profile.displayName }).success(function(user) {
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

  var host = 'http://local1.ebu.io:8001';
  var authorizationURL = '/authorize';
  var tokenURL = '/token';
  var client_id = '1';
  var client_secret = 'ssh-secret';
  var callbackURL = 'http://local.ebu.io:8000/auth/provider/callback';

  app.get('/auth/provider', function(req, res, next) {

    var params = querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      redirect_uri: callbackURL
    });

    res.redirect(host + authorizationURL + '?' + params);
  });

  app.get('/auth/provider/callback',
    function(req, res, next) {

      if (!req.user) {
        return res.redirect('/test?error');
      }

      var error = req.query.error;
      if (error) {
        return res.redirect('/me?error='+encodeURI(error));
      }

      var code = req.query.code;
      var state = req.query.state;

      //TODO : Handle errors and check inputs

      var query = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': callbackURL
      };

      request.post({url: host + tokenURL,
          headers: { 'content-type': 'application/json' },
          'auth': {
            'user': client_id,
            'pass': client_secret,
            'sendImmediately': false
          },
          body: JSON.stringify(query)
        }, function(err, response, body) {

          if (err || response.statusCode !== 200) {
            return next(err);
          }

          var data = JSON.parse(body);

          if (data.token && data.token_type && data.token_type === 'bearer') {
            db.Token.create({domain: 'cpa.local.ebu.io', token: data.token })
              .complete(function(err, token) {
                db.User.find({id: req.user.id}).success(function(user) {
                  user.addToken(token).success(function(token) {
                    res.redirect('/me?ok&token='+token.token);
                  });
                });
              });
          }
          else {
            next(err);
          }
        });
    });

  //Github
  app.get('/auth/github',
    passport.authenticate('github'));

  app.get('/auth/github/callback',
    passport.authenticate('github', {
      successRedirect: '/me?success',
      failureRedirect: '/?error=login_failed'
    }));

  app.get('/me',
    function(req, res, next) {
      if (!req.user) {
        res.redirect('/?login_required');
      } else {
        db.User.find({ id: req.user.id }).success(function(user) {
          user.getTokens().success(function(tokens) {
            res.render('me.ejs', { user: req.user, tokens: tokens });
          });
        });
      }
    });

  app.get('/test',
    function(req, res, next) {
      if (!req.user) {
        return res.redirect('/me');
      }
      res.send("ok: " + req.user);
    });
};
