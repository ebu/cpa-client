'use strict';

var config = { domains: {} };

config.domains[process.env.CPA_SERVICE_PROVIDER_NAME] = {
  domain: process.env.CPA_SERVICE_PROVIDER_DOMAIN,
  id: process.env.CPA_SERVICE_ID,
  http: true
};

module.exports = config;

