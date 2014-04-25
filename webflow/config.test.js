"use strict";

exports.db = {
  type: 'sqlite',

  // Database filename for SQLite
  // filename: 'test.sqlite',

  // For debugging, log SQL statements to the console
  debug: false
};

exports.authorization_provider = {
  name:              "Example AP",
  authorization_uri: "https://ap.example.com/authorized",
  base_uri:          "https://ap.example.com",
  modes:             ["client", "user"]
};

exports.service_provider = {
  name:   "BBC1",
  scope:  "https://sp.example.com/"
};



exports.identity_providers = {
  github: {
    enabled: true,
    client_id: '-',
    client_secret: '-',
    callback_url: 'http://local.ebu.io:8000/auth/github/callback'
  }
};
