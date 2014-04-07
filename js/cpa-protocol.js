
var cpaProtocol = {};
cpaProtocol.registration = {};

cpaProtocol.config = {
  ap_register_url: 'register',
  ap_token_url: 'token',
  ap_associate_url: 'associate',
  ap__url: 'token',

  sp_tokeninfo_url: 'tokeninfo'
};


/**
 *  Discover the responsible AP and the available modes for a scope
 */

cpaProtocol.getAPInfos = function(scope, done) {
  done(null, 'http://local.ebu.io:8000/', { anonymous: true, client: true, user: true });
};

/**
 * Discover available modes for a scope
 */

cpaProtocol.getAvailableModes = function(scope, done) {

  requestHelper.get(scope+cpaProtocol.config.sp_tokeninfo_url)
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

cpaProtocol.requestUserCode = function(clientId, serviceProvider, done) {

  var body = 'client_id=' + clientId + '&service_provider=' + serviceProvider + '&response_type=device_code';


  Logger.info('REQUEST USER CODE');

  requestHelper.postForm(cpaProtocol.config.authorization_url, body)
    .success(function(data, textStatus, jqXHR) {
      if(jqXHR.status === 200) {

        Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', data);

        storage.persistent.setValue('pairing_code', serviceProvider, {
          device_code: data.device_code,
          user_code: data.user_code,
          verification_uri: data.verification_uri
        });

        done(null, jqXHR.status, data);
      } else {
        Logger.error('Reply ' + jqXHR.status + '(' + textStatus + '): ', 'wrong status code');
        done(new Error({message: 'wrong status code', 'jqXHR': jqXHR}), jqXHR.status, textStatus);
      }
    })
    .fail(function(jqXHR, textStatus) {
      Logger.error('Reply ' + jqXHR.status + '(' + textStatus + '): ', 'request failed');
      done(new Error({message: 'request failed', 'jqXHR': jqXHR, 'textStatus': textStatus }));
    });
};

cpaProtocol.requestClientAccessToken = function(APBaseUrl, clientId, clientSecret, scope, done) {

  var body = {
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    scope: scope
  };

  Logger.info('REQUEST STANDALONE ACCESS TOKEN');

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


cpaProtocol.requestAccessToken = function(clientId, deviceCode, serviceProvider, done) {

  var body = 'client_id=' + clientId + '&code=' + deviceCode + '&grant_type=authorization_code';

  Logger.info('REQUEST ACCESS TOKEN');

  requestHelper.postForm(cpaProtocol.config.authorization_url, body)
    .success(function(data, textStatus, jqXHR) {
      Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', data);

      storage.persistent.delete('pairing_code');
      storage.persistent.setValue('access_token', serviceProvider, data);

      done(null, false);
    })
    .fail(function(jqXHR, textStatus) {
      if(jqXHR.responseJSON.error === 'authorization_pending') {
        Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', 'authorization_pending');
        done(null, true);
      } else {
        Logger.error('Reply ' + jqXHR.status + '(' + textStatus + '): ', 'request failed');
        done(new Error({message: 'request failed', 'jqXHR': jqXHR, 'textStatus': textStatus }), null);
      }
    });
};
