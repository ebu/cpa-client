var radioTag = {};

radioTag.config = {
  sp_tag_url: 'tag',
  sp_listtag_url: 'tags'
};

var extractTags = function(xmlData) {
  var tags = [];
  var doc = $(xmlData);
  var author =  doc.find("author").find("name")[0].textContent;
  var entries = doc.find("feed").find("entry");

  for (var i = 0; i < entries.length; i++) {
    var tag = {
      author: author,
      title: $(entries[i]).find("title")[0].textContent,
      summary: $(entries[i]).find("summary")[0].textContent,
      publishedDate: $(entries[i]).find("published")[0].textContent
    };

    tags.push(tag);
  }

  return tags;
};

radioTag.tag = function(channel, token, done) {
  var body = 'station='+channel.radiodns_id+'&time='+Math.floor(new Date().getTime()/1000);

  var requestToken = (token.mode === 'ANONYMOUS_MODE') ? null : token.access_token;

  var url = new URI({
    protocol: channel.https ? "https" : "http",
    hostname: token.domain,
    path:     radioTag.config.sp_tag_url,
  });

  requestHelper.postForm(url, body, requestToken)
    .success(function(xmlData) {
      var tag = extractTags(xmlData)[0];

      done(null, tag);
    })
    .fail(function(err, textStatus, jqXHR) {
      Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ');
      done(null);
    });
};

radioTag.listTags = function(channel, token, done) {
  var url = new URI({
    protocol: channel.https ? "https" : "http",
    hostname: token.domain,
    path:     radioTag.config.sp_listtag_url,
  });

  requestHelper.get(url, token.access_token)
    .success(function(xmlData) {
      var tags = extractTags(xmlData);
      done(null, tags);
    })
    .fail(function(err, textStatus, jqXHR) {
      Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ');
      done(null);
    });
};
