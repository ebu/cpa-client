
var appViews = {

  switchView: function(name, body) {
    $('#display-title').html(name);
    $('#display').html(body);
  },

  scanning: function() {
    var html = new EJS({url: 'views/scanning.ejs'}).render({});
    this.switchView('scanning', html);
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

  error: function(errorMessage) {
    var html = new EJS({url: 'views/error.ejs'}).render({
      message: errorMessage
    });
    this.switchView('error', html);
  },

  displayUserCode: function(userCode, verificationUri) {
    var html = new EJS({url: 'views/user_code.ejs'}).render({
      user_code: userCode, verification_uri: verificationUri
    });
    this.switchView('user code', html);
  },

  successfulPairing: function(accessToken) {
    var html = new EJS({url: 'views/success.ejs'}).render({
      message: 'The device is paired. Here is the access token: '+ accessToken
    });
    this.switchView('Device paired', html);
  }

};


var appFsm = new machina.Fsm({

  initialize: function() {

    var self = this;
    $('#power_btn').click(function() { self.handle('switch_on'); });
    $('#reset_btn').click(function() {
      storage.reset();
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
    appViews.error({message: err.message});
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
        appViews.scanning();

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
        storage.volatile.put('current_channel', channel);

        if (storage.persistent.get('client_information')) {
          // TODO: Check according to the SP.
          if(storage.persistent.get('access_token')) {
            self.transition('SUCCESSFUL_PAIRING');
          } else {
            self.transition('AUTHORIZATION_INIT');
          }
        } else {
          self.transition('CLIENT_REGISTRATION');
        }
      }
    },

    'CLIENT_REGISTRATION': {
      _onEnter: function() {
        var self = this;
        cpaProtocol.registerClient('Demo Client', 'cpa-client', '1.0.1', function(err, statusCode, body) {
          if(err) {
            return error(err);
          }
          self.transition('AUTHORIZATION_INIT');
        });
      }
    },

    'AUTHORIZATION_INIT': {
      _onEnter: function() {
        var self = this;

        var clientId = storage.persistent.get('client_information').client_id;

        cpaProtocol.requestUserCode(clientId, function(err){
          if(err) {
            return self.error(err);
          }

          self.transition('AUTHORIZATION_PENDING');
        });
      }
    },

    'AUTHORIZATION_PENDING': {
      _onEnter: function(){
        var self = this;
        var pairingCode = storage.persistent.get('pairing_code');
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
        var pairingCode = storage.persistent.get('pairing_code');
        var clientInformation = storage.persistent.get('client_information');

        cpaProtocol.requestAccessToken(clientInformation.client_id,
          pairingCode.device_code, function(err, authorizationPending){
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
        var accessTokens = storage.persistent.get('access_token');
        appViews.successfulPairing(accessTokens[0].token);
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
