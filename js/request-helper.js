
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
