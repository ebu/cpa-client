"use strict";

var app = require('../../lib/app');

describe('GET /', function() {
  beforeEach(function(done) {
    var self = this;

    request.get('/').end(function(err, res) {
      self.res = res;
      done(err);
    });
  });

  it('respond with something', function() {
    expect(this.res.statusCode).to.equal(200);
  });

  it('should respond with HTML', function() {
    expect(this.res.headers['content-type']).to.equal('text/html; charset=utf-8');
    expect(this.res.text).to.match(/^<!DOCTYPE html>\n<html>/);
  });
});
