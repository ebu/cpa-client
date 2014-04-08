
var radioTag = {};

radioTag.config = {
  sp_tag_url: 'tag',
  sp_listtag_url: 'tag'
};


radioTag.tag = function(token, done) {
  var body = 'station=dab.4fff.etc&time='+new Date().getTime();

  requestHelper.postForm(token.scope + radioTag.config.sp_tag_url, body, token.token)
    .success(function(xmlData) {

      var  doc = $(xmlData);
      var title = doc.find("entry").find("title")[0].textContent;
      var summary = doc.find("feed").find("entry").find("summary")[0].textContent;
      var publishedDate = doc.find("feed").find("entry").find("published")[0].textContent;
      var author = doc.find("author").find("name")[0].textContent;

      done(null, title, summary, author, publishedDate);
    })
    .fail(function(err) {
      Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', data);
      done(null, data);
    });

};


radioTag.listTags = function(token, done) {
  requestHelper.get(token.scope + radioTag.config.sp_listtag_url, token.token)
    .success(function(xmlData) {

      var  doc = $(xmlData);
      var title = doc.find("entry").find("title")[0].textContent;
      var summary = doc.find("feed").find("entry").find("summary")[0].textContent;
      var publishedDate = doc.find("feed").find("entry").find("published")[0].textContent;
      var author = doc.find("author").find("name")[0].textContent;

      done(null, title, summary, author, publishedDate);
    })
    .fail(function(err) {
      Logger.info('Reply ' + jqXHR.status + '(' + textStatus + '): ', data);
      done(null, data);
    });

};
