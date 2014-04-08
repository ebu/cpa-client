
var requestHelper = {

  postJSON: function(url, body, accessToken){

    Logger.info('Request: POST ' + url);
    Logger.info('Content-type: application/json');
    Logger.info('Body: ', JSON.stringify(body));
    Logger.info('***********');

    return $.ajax({
      type: "POST",
      url: url,
      data: JSON.stringify(body),
      contentType: 'application/json',
      beforeSend: function (xhr) {
        if (accessToken) {
          Logger.info('Authorization: Bearer ' + accessToken);
          xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
        }
      }
    });
  },

  postForm: function(url, uriEncodedBody, accessToken) {

    Logger.info('Request: POST ' + url);
    Logger.info('Content-type: application/x-www-form-urlencoded');
    Logger.info('Body: ', uriEncodedBody);
    Logger.info('***********');

    return $.ajax({
      type: "POST",
      url: url,
      contentType: 'application/x-www-form-urlencoded',
      data: uriEncodedBody,
      beforeSend: function (xhr) {
        if (accessToken) {
          Logger.info('Authorization: Bearer ' + accessToken);
          xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
        }
      }
    });
  },

  get: function(url, accessToken) {

    Logger.info('Request: GET ' + url);

    return $.ajax({
      type: "GET",
      url: url,
      beforeSend: function (xhr) {
        if (accessToken) {
          Logger.info('Authorization: Bearer ' + accessToken);
          xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
        }
      }
    });
  }
};
