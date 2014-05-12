"use strict";

module.exports = {
  db: {
    host: '',
    port: 3306,
    user: '',
    password: '',
    type: 'sqlite',

    // Database filename for SQLite
    filename: 'data/dev.sqlite',

    // For debugging, log SQL statements to the console
    debug: true
  },
  cpa: {
    client_id: 1,
    client_secret: '',
    client_base_uri: '',
    authorization_provider_uri: ''
  },
  service_provider: {
    name: '',
    scope: ''
  },
  identity_providers: {
    github: {
      enabled: true,
      client_id: '',
      client_secret: '',
      callback_url: ''
    }
  }
};

