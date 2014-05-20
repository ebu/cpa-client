"use strict";

var app = require('../../lib/app');

describe('GET /status', function() {
  before(function(done) {
    var self = this;

    request
      .get('/status')
      .end(function(err, res) {
        self.res = res;
        done(err);
      });
  });

  it('should return status 200', function() {
    expect(this.res.statusCode).to.equal(200);
  });

  it('should return plain text', function() {
    expect(this.res.headers['content-type']).to.equal('text/plain; charset=utf-8');
  });

  it('should return status message', function() {
    expect(this.res.text).to.equal('Service Provider up and running');
  });
});
