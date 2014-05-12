
var cpaProtocol = {};
cpaProtocol.registration = {};

cpaProtocol.config = {
  ap_register_url: 'register',
  ap_token_url: 'token',
  ap_associate_url: 'associate',

  sp_tokeninfo_url: 'tokeninfo'
};


/**
 *  Discover the responsible AP and the available modes for a scope
 */


cpaProtocol.getServiceInfos = function(scope, done) {
  for (var station_name in config.scopes) {
    if (config.scopes[station_name] === scope) {
      done(null, config.apBaseUrl, config.modes[station_name]);
      return;
    }
  }
  done(new Error('Unable to find available modes for scope : ' + scope));
};

/**
 * Discover available modes for a scope
 */

cpaProtocol.getAvailableModes = function(scope, done) {

  requestHelper.get(scope + cpaProtocol.config.sp_tokeninfo_url)
    .success(function(data, textStatus, jqXHR) {
      done(null, { anonymous: true, client: true, user: true });
    })
    .fail(function(jqXHR, textStatus) {
      Logger.error('Unable to discover authentication modes: ' + jqXHR.status + '(' + textStatus + '): ', 'request failed');
      done(new Error({message: 'Unable to discover authentication modes', 'jqXHR': jqXHR}), jqXHR.status, textStatus);
    });
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

cpaProtocol.requestUserCode = function(APBaseUrl, clientId, clientSecret, scope, done) {
  var body = {
    client_id: clientId,
    client_secret: clientSecret,
    scope: scope
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

cpaProtocol.requestClientAccessToken = function(APBaseUrl, clientId, clientSecret, scope, done) {
  var body = {
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    scope: scope
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


cpaProtocol.requestUserAccessToken = function(APBaseUrl, clientId, clientSecret, deviceCode, scope, done) {
  var body = {
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    device_code: deviceCode,
    scope: scope
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
