
var cpaProtocol = {};
cpaProtocol.registration = {};

cpaProtocol.config = {
  register_url: config.auth_provider_url + '/register',
  authorization_url: config.auth_provider_url + '/token'
};

/**
 * Discover available modes for a scope
 */

cpaProtocol.getAvailableMode = function(scope) {
  return { anonymous: true, client: true, user: true};
};

/**
 * Register the client with the Authentication Provider

 * done: function(err, status_code, body) {}
 *
 */
cpaProtocol.registerClient = function(clientName, softwareId, softwareVersion, done){

  var registrationBody = {
    client_name: clientName,
    software_id: softwareId,
    software_version: softwareVersion
  };

  Logger.info('CLIENT REGISTRATION');

  requestHelper.postJSON(cpaProtocol.config.register_url, registrationBody)
    .success(function(data, textStatus, jqXHR) {

      if(jqXHR.status === 201) {

        storage.persistent.put('client_information', {
          client_id: data.client_id,
          client_secret: data.client_secret
        });

        Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', data);

        done(null, jqXHR.status, data);
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

cpaProtocol.requestClientAccessToken = function(clientId, clientSecret, serviceProvider, done) {
  var body = 'client_id=' + clientId + '&client_secret=' + clientSecret + '&service_provider=' + serviceProvider + '&grant_type=authorization_code';

  Logger.info('REQUEST STANDALONE ACCESS TOKEN');

  requestHelper.postForm(cpaProtocol.config.authorization_url, body)
    .success(function(data, textStatus, jqXHR) {
      Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', data);
      storage.persistent.setValue('access_token', serviceProvider, data);
      done(null);
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
