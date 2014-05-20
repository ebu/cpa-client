"use strict";

module.exports = {
  db: {
    type: 'sqlite',

    // Database filename for SQLite
    // filename: 'test.sqlite',

    // For debugging, log SQL statements to the console
    debug: false
  },
  cpa: {
    client_id: 100,
    client_secret: '123',
    client_base_uri: 'https://client.example.com',
    authorization_provider_uri: 'https://ap.example.com'
  },
  service_provider: {
    name:   "BBC1",
    scope:  "https://sp.example.com/"
  },
  identity_providers: {
    github: {
      enabled: true,
      client_id: '-',
      client_secret: '-',
      callback_url: 'https://client.example.com/auth/github/callback'
    }
  }
};
