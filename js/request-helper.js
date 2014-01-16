
var requestHelper = {};

requestHelper.postJSON = function(url, body){

  return $.ajax({
    type: "POST",
    url: url,
    data: JSON.stringify(body),
    contentType: 'application/json',
    dataType: 'json'
  });

};


requestHelper.postForm = function(url, uriEncodedBody) {

  return $.ajax({
    type: "POST",
    url: url,
    contentType: 'application/x-www-form-urlencoded',
    data: uriEncodedBody
  });

};
