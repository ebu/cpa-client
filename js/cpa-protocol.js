
var cpaProtocol = {};
cpaProtocol.registration = {};

cpaProtocol.config = {
  register_url: 'http://vagrant.ebu.io:3000/register',
  authorization_url: 'http://vagrant.ebu.io:3000/token'
};


cpaProtocol.register = function(clientName, softwareId, softwareVersion, done){

  var registrationBody = {
    client_name: clientName,
    software_id: softwareId,
    software_version: softwareVersion
  };

  Logger.info('Registering ', registrationBody, ' to ', cpaProtocol.config.register_url);

  requestHelper.postJSON(cpaProtocol.config.register_url, registrationBody)
    .success(function(data, textStatus, jqXHR) {

      storage.persistent.put('client_information', {
        client_id: data.client_id,
        client_secret: data.client_secret,
        registration_access_token: data.registration_access_token,
        registration_client_uri: data.registration_client_uri
      });

      done();

    }).fail(function( jqXHR, textStatus ) {
      done(new Error({message: 'request failed', 'jqXHR': jqXHR, 'textStatus': textStatus }));
    });
};

cpaProtocol.requestUserCode = function(clientId, done) {

  var body = 'client_id=' + clientId + '&' + 'response_type=device_code';

  requestHelper.postForm(cpaProtocol.config.authorization_url, body)
    .success(function(data, textStatus, jqXHR) {
      storage.persistent.put('pairing_code', {
        device_code: data.device_code,
        user_code: data.user_code,
        verification_uri: data.verification_uri
      });

      done();
    }).fail(function(jqXHR, textStatus) {
      done(new Error({message: 'request failed', 'jqXHR': jqXHR, 'textStatus': textStatus }));
    });
};


cpaProtocol.requestAccessToken = function(clientId, deviceCode, done) {

  var body = 'client_id=' + clientId + '&code=' + deviceCode + '&grant_type=authorization_code';


  requestHelper.postForm(cpaProtocol.config.authorization_url, body)
    .success(function(data, textStatus, jqXHR) {
      Logger.log(data);

      var accessTokens = storage.persistent.get('access_token');
      if(!accessTokens) {
        accessTokens = {};
      }

      accessTokens[0] = data;
      storage.persistent.delete('pairing_code');
      storage.persistent.put('access_token', accessTokens);

      done(null, false);
    }).fail(function(jqXHR, textStatus) {

      if(jqXHR.responseJSON.error === 'authorization_pending') {
        done(null, true);
      } else {
        done(new Error({message: 'request failed', 'jqXHR': jqXHR, 'textStatus': textStatus }), null);
      }
    });
};
