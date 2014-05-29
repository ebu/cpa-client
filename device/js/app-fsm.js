var appViews = {

  switchView: function(name, body) {
    $('#display-title').html(name);
    $('#display').html(body);
  },

  deviceOff: function() {
    var now = new Date();

    var html = new EJS({
      url: 'views/device-off.ejs'
    }).render({
      day:  $.format.date(now, 'ddd'),
      date: $.format.date(now, 'dd MMM yyyy'),
      time: $.format.date(now, 'hh:m')
      });
    this.switchView('device_off', html);
  },

  channelList: function(channelArray) {
    var html = new EJS({url: 'views/channel-list.ejs'}).render({
      channels: channelArray
    });
    this.switchView('channel_list', html);
  },

  displayModeSelection: function(availableModes) {
    var html = new EJS({url: 'views/mode-selection.ejs'})
      .render({availableModes: availableModes});
    this.switchView('mode_selection', html);
  },

  displayUserCode: function(userCode, verificationUri) {
    var html = new EJS({url: 'views/user-code.ejs'}).render({
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

  successfulPairing: function(accessToken, mode, domainDisplayName, userName) {
    var message = { title: '', accessToken: ''};
    if (!userName) {
      message = {
        title: '<strong>This is the unique identifier for your device on ' +
          domainDisplayName + '</strong>',

        accessToken: accessToken.substr(0, 20) + '<br>' +
          accessToken.substr(20, 50) + '<br>'
      };
    } else {
      message = {
        title: '<strong>This is the unique identifier for ' + userName + '\'s ' +
          'device on ' + domainDisplayName + '</strong>',

        accessToken: accessToken.substr(0, 20) + '<br>' +
          accessToken.substr(20, 50) + '<br>'
      };
    }


    var html = new EJS({url: 'views/success.ejs'}).render(message);
    this.switchView('Device paired', html);
  },

  player: function(channel, mode) {
    var html = new EJS({url: 'views/player.ejs'}).render({
      message: 'You are listening to: ' + channel.name,
      mode: mode
    });
    this.switchView('Player', html);
  },

  listTags: function(channel) {
    var html = new EJS({url: 'views/tag-list.ejs'}).render({
      message: 'Tags for channel: ' + channel.name
    });
    this.switchView('Tag list', html);
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
    $('#power_btn').click(function() {
      if (self.state === 'DEVICE_OFF') {
        self.handle('switch_on');
      } else {
        self.transition('DEVICE_OFF');
      }
    });

    $('#reset_btn').click(function() {
      storage.reset();
      Logger.info('**** RESET STORAGE ****');
      self.transition('DEVICE_OFF');
    });

    self.on('*', function(message, options) {
      if(message === 'transition') {
        if(options.action) {
          Logger.debug('[FSM] ', message, ': ', options.fromState, ' -> ',
            options.action, ' -> ', options.toState );
        } else {
          Logger.debug('[FSM] ', message, ': ', options.fromState, ' -> ',
            options.toState );
        }
      }
    });
  },

  getCurrentChannel: function() {
    var currentChannelName = storage.volatile.get('current_channel');
    return storage.volatile.getValue('channels', currentChannelName);
  },

  setCurrentChannel: function(channelName) {
    storage.volatile.put('current_channel', channelName);
  },

  setCurrentChannelParam: function(param, value) {
    var currentChannelName = storage.volatile.get('current_channel');
    var channel = storage.volatile.getValue('channels', currentChannelName);
    channel[param] = value;
    storage.volatile.setValue('channels', currentChannelName, channel);
  },


  getMode: function(domain) {
    return storage.persistent.getValue('mode', domain);
  },

  setMode: function(domain, mode) {
    storage.persistent.setValue('mode', domain, mode);
  },

  getToken: function(domain) {
    return storage.persistent.getValue('token', domain);
  },

  setToken: function(domain, mode, token) {
    console.log('USER token: ', token);
    token.mode = mode;
    storage.persistent.setValue('token', domain, token);
  },

  getAssociationCode: function(domain) {
    return storage.persistent.getValue('association_code', domain);
  },

  setAssociationCode: function(apBaseUrl, domain, verificationUrl,
                               deviceCode, userCode, interval, expiresIn) {
    storage.persistent.setValue('association_code', domain, {
      ap_base_url: apBaseUrl,
      domain: domain,
      verification_url: verificationUrl,
      device_code: deviceCode,
      user_code: userCode,
      interval: interval,
      expires_in: expiresIn
    });
  },

  getClientInformation: function(apBaseUrl) {
    return storage.persistent.getValue('client_information', apBaseUrl);
  },

  setClientInformation: function(apBaseUrl, clientId, clientSecret) {
    storage.persistent.setValue('client_information', apBaseUrl, {
      client_id: clientId,
      client_secret: clientSecret
    });
  },

  error: function(err) {
    Logger.error(JSON.stringify(err));
    appViews.error(JSON.stringify(err));
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
        var channels = [];
        for(var channelName in config.domains) {
          var channel = {
            name: channelName,
            domain: config.domains[channelName],
            radiodns_id: 'dab.ce1.ce15.c221.' + channelName, //dummy
            ap_base_url: null,
            available_modes: {}
          };

          storage.volatile.setValue('channels', channelName, channel);
        }

        var self = this;
        setTimeout(function() {
          var channelList = storage.volatile.get('channels');
          if(!channelList || channelList.length === 0) {
            return self.error({message: 'Unable to discover any channel'});
          }
          self.transition('CHANNEL_LIST');
        }, 100);
      }
    },

    'CHANNEL_LIST': {
      _onEnter: function() {
        var channels = storage.volatile.get('channels');

        var channelArray = [];
        for (var k in channels) {
          var ch = channels[k];

          var token = this.getToken(ch.domain);
          if (token) {
            ch.mode = token.mode;
            ch.mode_description = (token.user_name)? token.user_name : 'This device';
          } else {
            ch.mode = null;
            ch.mode_description = null;
          }
          channelArray.push(ch);

        }
        appViews.channelList(channelArray);

        var self = this;
        $('.channel-list>a').click(function() {
          self.handle('onChannelClick',  $(this).attr('data-channel'),
            $(this).attr('data-domain'));
        });
      },

      'onChannelClick': function(channelName, domain) {
        var self = this;

        self.setCurrentChannel(channelName);
        var channel = self.getCurrentChannel();

        if (! channel.ap_base_url) {
          self.transition('AP_DISCOVERY');
        }
        else if (! self.getClientInformation(channel.ap_base_url)) {
          self.transition('CLIENT_REGISTRATION');
        }
        else {
          if (self.getToken(channel.domain)) {
            self.transition('PLAYER');
          } else {
            self.transition('MODE_SELECTION');
          }
        }
      }
    },

    'AP_DISCOVERY': {
      _onEnter: function() {

        var self = this;
        var channel = self.getCurrentChannel();

        cpaProtocol.getServiceInfos(channel.domain, function(err,
                                                            apBaseUrl,
                                                            availableModes) {
          if(err) {
            return self.error(err);
          }
          self.setCurrentChannelParam('ap_base_url', apBaseUrl);
          self.setCurrentChannelParam('available_modes', availableModes);
          if(self.getClientInformation(apBaseUrl) !== null) {
            self.transition('MODE_SELECTION');
          } else {
            self.transition('CLIENT_REGISTRATION');
          }
        });
      }
    },

    'CLIENT_REGISTRATION': {
      _onEnter: function() {
        appViews.displayProgress('Client registration');

        var self = this;
        var channel = self.getCurrentChannel();

        cpaProtocol.registerClient(channel.ap_base_url,
          'Demo Client',
          'cpa-client',
          '1.0.2',
          function(err, clientId, clientSecret) {
            if(err) {
              return self.error(err);
            }

            self.setClientInformation(channel.ap_base_url, clientId, clientSecret);
            self.transition('MODE_SELECTION');
          });
      }
    },

    'MODE_SELECTION': {
      _onEnter: function() {
        var self = this;
        var channel = self.getCurrentChannel();
        var mode = self.getMode(channel.domain);

        if (mode === 'USER_MODE') {
          if (self.getToken(channel.domain)) {
            self.transition('PLAYER');
          } else {
            var associationCode = self.getAssociationCode(channel.domain);
            if (!associationCode) {
              self.transition('AUTHORIZATION_INIT');
            } else {
              self.transition('AUTHORIZATION_PENDING');
            }
          }
        }
        else if (mode === 'CLIENT_MODE') {
          if (self.getToken(channel.domain)) {
            self.transition('PLAYER');
          } else {
            self.transition('CLIENT_AUTH_INIT');
          }
        }
        else if (mode === 'ANONYMOUS_MODE') {
          if (self.getToken(channel.domain)) {
            self.transition('PLAYER');
          } else {
            self.transition('ANONYMOUS_INIT');
          }
        }
        else {
          appViews.displayModeSelection(channel.available_modes);

          var self = this;
          $('a.list-group-item').click(function() {
            self.handle('onModeClick',  $(this).attr('data-mode'));
          });
        }
      },

      'onModeClick': function(mode) {
        var self = this;

        var channel = self.getCurrentChannel();

        self.setMode(channel.domain, mode);


        if(mode === 'USER_MODE') {
          self.transition('AUTHORIZATION_INIT');
        }
        else if(mode === 'CLIENT_MODE') {
          self.transition('CLIENT_AUTH_INIT');
        }
        else if(mode == 'ANONYMOUS_MODE') {
          self.transition('ANONYMOUS_INIT');
        }
        else {
          return self.error(new Error('Unknown mode'));
        }

      }
    },

    'ANONYMOUS_INIT': {
      _onEnter: function() {
        var self = this;
        var channel = self.getCurrentChannel();
        var token = {
          domain: channel.domain,
          domain_display_name: channel.name,
          user_name: 'Anonymous',
          mode: 'ANONYMOUS_MODE',
          token: null,
          token_type: null
        };

        self.setToken(channel.domain, 'ANONYMOUS_MODE', token);

        self.transition('PLAYER');
      }
    },

    'AUTHORIZATION_INIT': {
      _onEnter: function() {
        var self = this;
        var channel = self.getCurrentChannel();
        var associationCode = self.getAssociationCode(channel.domain);
        var clientInformation = self.getClientInformation(channel.ap_base_url);

        if (!associationCode){
          cpaProtocol.requestUserCode(channel.ap_base_url,
            clientInformation.client_id,
            clientInformation.client_secret,
            channel.domain,
            function(err, data){
              if(err) {
                return self.error(err);
              }

              self.setAssociationCode(channel.ap_base_url,
                channel.domain,
                data.verification_uri,
                data.device_code,
                data.user_code,
                data.interval,
                data.expires_in
              );

              self.transition('AUTHORIZATION_PENDING');
            });
        } else {
          self.transition('AUTHORIZATION_PENDING');
        }

      }
    },

    'CLIENT_AUTH_INIT': {
      _onEnter: function() {
        var self = this;

        var channel = self.getCurrentChannel();
        var clientInformation = self.getClientInformation(channel.ap_base_url);

        cpaProtocol.requestClientAccessToken(channel.ap_base_url,
          clientInformation.client_id,
          clientInformation.client_secret,
          channel.domain,
          function(err, clientModeToken){
            if(err) {
              return self.error(err);
            }
            self.setToken(channel.domain, 'CLIENT_MODE', clientModeToken);
            self.transition('SUCCESSFUL_PAIRING');
        });
      }
    },

    'AUTHORIZATION_PENDING': {
      _onEnter: function(){
        var self = this;

        var channel = self.getCurrentChannel();
        var associationCode = self.getAssociationCode(channel.domain);

        appViews.displayUserCode(associationCode.user_code, associationCode.verification_url);

        $('#verify_code_btn').click(function() {
          self.handle('onValidatePairingClick');
        });

        this.validatePollTimeout = setTimeout(function() {
          Logger.info('Polling to validate pairing and retrieve the access token.');
          self.handle('onValidatePairingClick');
        }, 5000);
      },

      'onValidatePairingClick': function() {
        if (this.validatePollTimeout) {
          Logger.debug('Clear polling timeout.');
          clearTimeout(this.validatePollTimeout);
        }

        this.transition('AUTHORIZATION_CHECK');
      }
    },

    'AUTHORIZATION_CHECK': {
      _onEnter: function() {
        var self = this;

        var channel = self.getCurrentChannel();
        var associationCode = self.getAssociationCode(channel.domain);
        var clientInformation = self.getClientInformation(channel.ap_base_url);

        cpaProtocol.requestUserAccessToken(channel.ap_base_url,
          clientInformation.client_id,
          clientInformation.client_secret,
          associationCode.device_code,
          channel.domain,
          function(err, userModeToken){
            if(err) {
              self.error(err);
            } else if(!userModeToken) {
              Logger.info('Authorization pending.');
              self.transition('AUTHORIZATION_PENDING');
            } else {
              Logger.info('Authorization granted, saving the access token.');
              self.setToken(channel.domain, 'USER_MODE', userModeToken);
              self.transition('SUCCESSFUL_PAIRING');
            }
          }
        );
      }
    },

    'SUCCESSFUL_PAIRING': {
      _onEnter: function() {
        var self = this;
        var channel = self.getCurrentChannel();
        var token = self.getToken(channel.domain);
        var mode = token.mode;

        appViews.successfulPairing(token.access_token, mode, token.domain_display_name, token.user_name);

        $('#ok-btn').click(function(){
          self.transition('PLAYER');
        });

        $('#trig-without-btn').click(function(){
          requestHelper.get(channel.domain + 'resource', null)
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

    'PLAYER': {
      _onEnter: function() {
        var self = this;
        var channel = self.getCurrentChannel();
        var token = self.getToken(channel.domain);

        var mode = token.mode;

        appViews.player(channel, mode);

        if (mode === 'ANONYMOUS_MODE') {
          $('#tag-history-btn').addClass('disabled');
        }

        $('#tag-history-btn').click(function() {
          self.transition('LIST_TAGS');
        });

        $('#tag-btn').click(function() {
          radioTag.tag(channel, token, function(err, tag) {
            if (err) {
              self.error(err);
            }
            var body = '<strong>' + tag.title + '</strong>';
            $('#message-panel').addClass('alert alert-success').html(body);
          });
        });
      }
    },

    'LIST_TAGS': {
      _onEnter: function() {
        var self = this;
        var channel = self.getCurrentChannel();
        var token = self.getToken(channel.domain);
        var mode = token.mode;

        appViews.listTags(channel, mode);

        radioTag.listTags(token, function(err, tags) {
          if(err) {
            self.error(err);
          }
          var htmlOutput = "";
          for(var t in tags) {
            htmlOutput += '<li>' + tags[t].title + '</li>';
          }
          $('#list').html(htmlOutput);
        });

        $('#back-btn').click(function() {
          self.transition('PLAYER');
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
