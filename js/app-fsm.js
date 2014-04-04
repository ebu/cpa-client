
var appViews = {

  switchView: function(name, body) {
    $('#display-title').html(name);
    $('#display').html(body);
  },

  deviceOff: function() {
    var html = new EJS({url: 'views/device_off.ejs'}).render({});
    this.switchView('device_off', html);
  },

  channelList: function(channelList) {
    var html = new EJS({url: 'views/channel_list.ejs'}).render({
      channels: channelList
    });
    this.switchView('channel_list', html);
  },

  displayModeSelection: function(availableModes) {
    var html = new EJS({url: 'views/mode_selection.ejs'}).render({availableModes: availableModes});
    this.switchView('mode_selection', html);
  },

  displayUserCode: function(userCode, verificationUri) {
    var html = new EJS({url: 'views/user_code.ejs'}).render({
      user_code: userCode, verification_uri: verificationUri
    });
    this.switchView('user_code', html);
  },

  displayProgress: function(message) {
    var html = new EJS({url: 'views/progress.ejs'}).render({
      'message': message
    });
    this.switchView('Progress: '+ message, html);
  },

  successfulPairing: function(accessToken, mode) {
    var html = new EJS({url: 'views/success.ejs'}).render({
      message: 'The device is in ' + mode + '. Here is the access token: '+ accessToken
    });
    this.switchView('Device paired', html);
  },

  error: function(errorMessage) {
    var html = new EJS({url: 'views/error.ejs'}).render({
      message: errorMessage
    });
    this.switchView('error', html);
  }

};


var appFsm = new machina.Fsm({

  initialize: function() {

    var self = this;
    $('#power_btn').click(function() { self.handle('switch_on'); });
    $('#reset_btn').click(function() {
      storage.reset();
      Logger.info('**** RESET STORAGE ****');
      self.transition('DEVICE_OFF');
    });

    self.on('*', function(message, options) {
      if(message === 'transition') {
        if(options.action) {
          Logger.debug('[FSM] ', message, ': ', options.fromState, ' -> ', options.action, ' -> ', options.toState );
        } else {
          Logger.debug('[FSM] ', message, ': ', options.fromState, ' -> ', options.toState );
        }
      }
    });
  },

  error: function(err) {
    Logger.error(err);
    appViews.error(err.message);
    this.transition('ERROR');
  },

  initialState: 'DEVICE_OFF',

  states : {

    'DEVICE_OFF': {
      _onEnter: function() {
        appViews.deviceOff();
      },

      'switch_on': function() {
        this.transition('SCANNING');
      }
    },

    'SCANNING': {
      _onEnter: function() {
        appViews.displayProgress('Scanning...');

        this.handle('getChannelList');

      },
      'getChannelList': function() {
        storage.volatile.put('channel_list', [{name: 'BBC1', data:''}, {name:'BBC2', data:''}]);

        var self = this;
        setTimeout(function() {
          var channelList = storage.volatile.get('channel_list');
          if(!channelList || channelList.length === 0) {
            return error({message: 'Unable to discover any channel'});
          }
          self.transition('CHANNEL_LIST');
        }, 100);
      }
    },

    'CHANNEL_LIST': {
      _onEnter: function() {
        appViews.channelList(storage.volatile.get('channel_list'));

        var self = this;
        $('.channel-list>a').click(function() {
          self.handle('onChannelClick',  $(this).attr('data-channel'));
        });
      },

      'onChannelClick': function(channel) {
        var self = this;


        var mode = storage.persistent.get('mode');
        var serviceProvider = channel;
        storage.volatile.put('current_channel', channel);

        if (storage.persistent.get('client_information')) {
          // TODO: Check according to the SP.

          if(storage.persistent.getValue('access_token', serviceProvider)) {
            self.transition('SUCCESSFUL_PAIRING');
          } else {
            var pairingCode = storage.persistent.getValue('pairing_code', serviceProvider);
            if(mode === 'PAIRING_MODE') {
              if(!pairingCode) {
                self.transition('AUTHORIZATION_INIT');
              } else {
                self.transition('AUTHORIZATION_PENDING');
              }

            }
            else if(mode === 'STANDALONE_MODE') {
              self.transition('CLIENT_AUTH_INIT');
            }
            else {
              self.transition('MODE_SELECTION');
            }
          }
        } else {
          self.transition('CLIENT_REGISTRATION');
        }
      }
    },

    'CLIENT_REGISTRATION': {
      _onEnter: function() {
        appViews.displayProgress('Client registration');
        var self = this;

        cpaProtocol.registerClient('Demo Client', 'cpa-client', '1.0.1', function(err, statusCode, body) {
          if(err) {
            return error(err);
          }
          self.transition('MODE_SELECTION');
        });
      }
    },

    'MODE_SELECTION': {
      _onEnter: function() {

        var availableModes = cpaProtocol.getAvailableMode();

        appViews.displayModeSelection(availableModes);

        var self = this;
        $('a.list-group-item').click(function() {
          self.handle('onModeClick',  $(this).attr('data-mode'));
        });
      },

      'onModeClick': function(mode) {
        var self = this;
        storage.persistent.put('mode', mode);

        // TODO: Check according to the SP.
        if(mode === 'PAIRING_MODE') {
          self.transition('AUTHORIZATION_INIT');
        }
        else if(mode === 'STANDALONE_MODE') {
          self.transition('CLIENT_AUTH_INIT');
        }
        else {
          return error(new Error('Unknown mode'));
        }

      }
    },

    'AUTHORIZATION_INIT': {
      _onEnter: function() {
        var self = this;

        var clientId = storage.persistent.get('client_information').client_id;
        var serviceProvider = storage.volatile.get('current_channel');

        cpaProtocol.requestUserCode(clientId, serviceProvider, function(err){
          if(err) {
            return self.error(err);
          }

          self.transition('AUTHORIZATION_PENDING');
        });
      }
    },


    'CLIENT_AUTH_INIT': {
      _onEnter: function() {
        var self = this;

        var client = storage.persistent.get('client_information');
        var serviceProvider = storage.volatile.get('current_channel');

        cpaProtocol.requestClientAccessToken(client.client_id,
          client.client_secret,
          serviceProvider,
          function(err){
            if(err) {
              return self.error(err);
            }
            self.transition('SUCCESSFUL_PAIRING');
        });
      }
    },

    'AUTHORIZATION_PENDING': {
      _onEnter: function(){
        var self = this;
        var serviceProvider = storage.volatile.get('current_channel');
        var pairingCode = storage.persistent.getValue('pairing_code', serviceProvider);

        appViews.displayUserCode(pairingCode.user_code, pairingCode.verification_uri);
        $('#verify_code_btn').click(function() { self.handle('onValidatePairingClick'); });
      },

      'onValidatePairingClick': function() {
        this.transition('AUTHORIZATION_CHECK');
      }
    },

    'AUTHORIZATION_CHECK': {
      _onEnter: function() {
        var self = this;
        var serviceProvider = storage.volatile.get('current_channel');
        var pairingCode = storage.persistent.getValue('pairing_code', serviceProvider);
        var clientInformation = storage.persistent.get('client_information');

        cpaProtocol.requestAccessToken(clientInformation.client_id,
          pairingCode.device_code, serviceProvider, function(err, authorizationPending){
            if(err) {
              self.error(err);
            } else if(authorizationPending) {
              alert('Go to the website');
              self.transition('AUTHORIZATION_PENDING');
            } else {
              self.transition('SUCCESSFUL_PAIRING');
            }
          });
      }
    },

    'SUCCESSFUL_PAIRING': {
      _onEnter: function() {
        var serviceProvider = storage.volatile.get('current_channel');
        var accessToken = storage.persistent.getValue('access_token', serviceProvider);
        var mode = storage.persistent.get('mode');

        appViews.successfulPairing(accessToken.token, mode);

        $('#trig-with-btn').click(function(){
          requestHelper.get(config.service_provider_url[serviceProvider] + '/resource', accessToken.token)
            .success(function(data, textStatus, jqXHR) {
              Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', data);
              alert(data.message);
            })
            .fail(function(jqXHR, textStatus) {
              Logger.error('Reply ' + jqXHR.status + '(' + textStatus + '): ', 'invalid request');
              alert('invalid request');
            });
        });


        $('#trig-without-btn').click(function(){
          requestHelper.get(config.service_provider_url[serviceProvider] + '/resource', null)
            .success(function(data, textStatus, jqXHR) {
              Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', data);
              alert(data.message);
            })
            .fail(function(jqXHR, textStatus) {
              Logger.error('Reply ' + jqXHR.status + '(' + textStatus + '): ', 'invalid request');
              alert('invalid request');
            });
        });
      }
    },

    'ERROR': {
      _onEnter: function() {
        Logger.error('end');

      }
    }
  }
});

//appFsm.handle('switch_on');
