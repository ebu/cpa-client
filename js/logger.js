
Logger.useDefaults();

Logger.setHandler(function (messages, context) {

  console.log('[' + context.level.name + '] ', messages);

  var messages_str = '';
  for (var m in messages) {
    if(typeof messages[m] === 'object') {
      messages_str += JSON.stringify(messages[m]);
    } else {
      messages_str += messages[m];
    }
  }

  $('#console').append('[' + context.level.name + '] ' + messages_str + '<br>');

});

Logger.log('Init logger');
