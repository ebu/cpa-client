
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

radioTag.tag = function(token, done) {
  var body = 'station=dab.4fff.etc&time='+new Date().getTime();

  requestHelper.postForm(token.scope + radioTag.config.sp_tag_url, body, token.token)
    .success(function(xmlData) {

      var tag = extractTags(xmlData)[0];

      done(null, tag);
    })
    .fail(function(err, textStatus, jqXHR) {
      Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ');
      done(null);
    });

};


radioTag.listTags = function(token, done) {
  requestHelper.get(token.scope + radioTag.config.sp_listtag_url, token.token)
    .success(function(xmlData) {
      var tags = extractTags(xmlData);
      done(null, tags);
    })
    .fail(function(err, textStatus, jqXHR) {
      Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ');
      done(null);
    });

};
