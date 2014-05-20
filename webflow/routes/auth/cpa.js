"use strict";

var db      = require('../../models');
var config  = require('../../config');

var querystring = require('querystring');
var http        = require('http');
var request     = require('request');
var async       = require('async');


// CPA Endpoints
var authorizationEndpoint = '/authorize';
var tokenEndpoint = '/token';

var apUri        = config.cpa.authorization_provider_uri;
var clientId     = config.cpa.client_id;
var clientSecret = config.cpa.client_secret;
var callbackURL   = config.cpa.client_base_uri + '/auth/cpa/callback';


var findUser = function(userId) {
  return function(callback) {
      db.User.find({
        id: userId
      })
      .complete(callback);
    };
};

var createToken = function(accessToken) {
  return function(user, callback) {
    db.Token.create({
      domain: config.sp_domain,
      token: accessToken
    })
    .complete(function(err, token) {
      user.addToken(token)
        .complete(callback);
    });
  };
};

var validateTokenReply = function(data) {
  return (data.token && data.token_type && data.token_type === 'bearer');
};

var requestAccessToken = function(code, next) {
  var query = {
    'grant_type': 'http://tech.ebu.ch/cpa/1.0/authorization_code',
    'code': code,
    'client_id': clientId,
    'redirect_uri': callbackURL
  };

  var reqOptions = {
    url: apUri + tokenEndpoint,
    headers: {
      'content-type': 'application/json'
    },
    'auth': {
      'user': clientId.toString(),
      'pass': clientSecret,
      'sendImmediately': false
    },
    body: JSON.stringify(query)
  };

  request.post(reqOptions, function(err, response, body) {
    if (err || response.statusCode !== 200) {
      next(err);
      return;
    }

    var data = JSON.parse(body);

    next(null, data);
  });
};

module.exports = function(app) {

  app.get('/auth/cpa', function(req, res) {
    var params = querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: callbackURL
    });



    res.redirect(apUri + authorizationEndpoint + '?' + params);
  });

  app.get('/auth/cpa/callback', function(req, res, next) {
    if (!req.user) {
      res.redirect('/?login_required');
      return;
    }

    var error = req.query.error;
    if (error) {
      res.redirect('/me?error=' + encodeURI(error));
      return;
    }

    var code = req.query.code;
    var state = req.query.state;
    var userId = req.user.id;

    //TODO : Handle errors and check inputs

    requestAccessToken(code, function(err, data) {
      if (validateTokenReply(data)) {
        async.waterfall([
          findUser(userId),
          createToken(data.token)
        ],
        function (err, token) {
          if (err) {
            next(err);
            return;
          }
          res.redirect('/me?ok');
        });
      }
      else {
        next(err);
      }
    });
  });
};
