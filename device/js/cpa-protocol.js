
var cpaProtocol = {};
cpaProtocol.registration = {};

/**
 * Endpoints defined in the CPA spec
 */
cpaProtocol.config = {
  ap_register_url:  'register',
  ap_token_url:     'token',
  ap_associate_url: 'associate',

  // RadioTag spec
  sp_discover_url:  'tags'
};

var parseWwwAuthenticate = function(challenge) {
  var regex = /(?:(\w*)\=\"(.*?))*\"/g;
  var match = [], data = {};
  while (match = regex.exec(challenge)) {
    data[match[1]] = match[2];
  }

  var modesArray = data.modes.split(',');
  var modes = {
    client:  (modesArray.indexOf('client') !== -1),
    user:    (modesArray.indexOf('user') !== -1),
    anonymous: false
  };

  return { apBaseUrl: data.uri+'/', modes: modes };
};

/**
 *  Discover the responsible AP and the available modes for a domain
 */


cpaProtocol.getServiceInfos = function(domain, done) {

  var getServiceInfosCallback = function (jqXHR) {
    var challenge = jqXHR.getResponseHeader('WWW-Authenticate');
    if (!challenge) {
      done(new Error('Missing WWW-Authenticate header. Please, make sure CORS headers are correctly sent. ("Access-Control-Expose-Headers: WWW-Authenticate")'));
      return;
    }

    var spInfos = parseWwwAuthenticate(challenge);
    done(null, spInfos.apBaseUrl, spInfos.modes);
  };

  var found = false;

  for (var station_name in config.domains) {
    if (config.domains[station_name] === domain) {
      found = true;
      requestHelper.get(domain + cpaProtocol.config.sp_discover_url)
        .done(function(body, textStatus, jqXHR) {
          getServiceInfosCallback(jqXHR);
        })
        .fail(function(jqXHR, textStatus, err) {
          getServiceInfosCallback(jqXHR);
        });
    }
  }

  if (!found) {
    done(new Error('Unable to find available modes for domain : ' + domain));
  }
};

/**
 * Register the client with the Authentication Provider

 * done: function(err, status_code, body) {}
 *
 */
cpaProtocol.registerClient = function(APBaseUrl, clientName, softwareId, softwareVersion, done){

  var registrationBody = {
    client_name: clientName,
    software_id: softwareId,
    software_version: softwareVersion
  };

  Logger.info('CLIENT REGISTRATION');

  requestHelper.postJSON(APBaseUrl + cpaProtocol.config.ap_register_url, registrationBody)
    .success(function(data, textStatus, jqXHR) {

      if(jqXHR.status === 201) {
        Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', data);
        done(null, data.client_id, data.client_secret);
      } else {
        Logger.error('Reply ' + jqXHR.status + '(' + textStatus + '): ', 'wrong status code');
        done(new Error({message: 'wrong status code', 'jqXHR': jqXHR}), jqXHR.status, textStatus);
      }

    }).fail(function( jqXHR, textStatus ) {
      Logger.error('Reply ' + jqXHR.status + '(' + textStatus + '): ', 'request failed');
      done(new Error({message: 'request failed', 'jqXHR': jqXHR}), jqXHR.status, textStatus);
    });
};

cpaProtocol.requestUserCode = function(APBaseUrl, clientId, clientSecret, domain, done) {
  var body = {
    client_id: clientId,
    client_secret: clientSecret,
    domain: domain
  };

  Logger.info('REQUEST USER CODE');

  requestHelper.postJSON(APBaseUrl + cpaProtocol.config.ap_associate_url, body)
    .success(function(data, textStatus, jqXHR) {
      if(jqXHR.status === 200) {
        Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', data);
        done(null, data);
      } else {
        Logger.error('Reply ' + jqXHR.status + '(' + textStatus + '): ', 'wrong status code');
        done({message: 'wrong status code', 'jqXHR': jqXHR});
      }
    })
    .fail(function(jqXHR, textStatus) {
      Logger.error('Reply ' + jqXHR.status + '(' + textStatus + '): ', 'request failed');
      done({ message: 'request failed', 'jqXHR': jqXHR, 'textStatus': textStatus });
    });
};

cpaProtocol.requestClientAccessToken = function(APBaseUrl, clientId, clientSecret, domain, done) {
  var body = {
    grant_type: 'http://tech.ebu.ch/cpa/1.0/client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    domain: domain
  };

  Logger.info('REQUEST CLIENT ACCESS TOKEN');

  requestHelper.postJSON(APBaseUrl + cpaProtocol.config.ap_token_url, body)
    .success(function(data, textStatus, jqXHR) {
      Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', data);
      done(null, data);
    })
    .fail(function(jqXHR, textStatus) {
      Logger.error('Reply ' + jqXHR.status + '(' + textStatus + '): ', 'request failed');
      done(new Error({ message: 'request failed', 'jqXHR': jqXHR, 'textStatus': textStatus }));
    });
};


cpaProtocol.requestUserAccessToken = function(APBaseUrl, clientId, clientSecret, deviceCode, domain, done) {
  var body = {
    grant_type: 'http://tech.ebu.ch/cpa/1.0/device_code',
    client_id: clientId,
    client_secret: clientSecret,
    device_code: deviceCode,
    domain: domain
  };

  Logger.info('REQUEST USER ACCESS TOKEN');

  requestHelper.postJSON(APBaseUrl + cpaProtocol.config.ap_token_url, body)
    .success(function(data, textStatus, jqXHR) {
      if(jqXHR.status === 202) {
        Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', 'authorization_pending');
        done(null, null);
      } else {
        Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', data);
        done(null, data);
      }
    })
    .fail(function(jqXHR, textStatus) {

      Logger.error('Reply ' + jqXHR.status + '(' + textStatus + '): ', 'request failed');
      done(new Error({message: 'request failed', 'jqXHR': jqXHR, 'textStatus': textStatus }), null);

    });
};
