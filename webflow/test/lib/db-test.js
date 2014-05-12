"use strict";

var app = require('../../lib/app');
var db  = require('../../models');
var requestHelper = require('../request-helper');

describe('PUT /user', function() {
  beforeEach(function(done) {
    requestHelper.sendRequest(this, '/user', {
      method: 'put',
      type:   'form',
      data:   { username:'NAME' }
    }, done);
  });

  // jshint expr:true
  it('should store the user in the database', function(done) {
    var name = 'NAME';

    db.User
      .find({ where: { username: name } })
      .complete(function(err, user) {
        expect(err).to.equal(null);
        expect(err).to.equal(null);
        expect(user).to.be.ok;
        expect(user.username).to.equal(name);
        done();
      });
  });
});
