"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    username: DataTypes.STRING
  }, {
    underscored: true,

    associate: function(models) {
      User.hasMany(models.Task);
    }
  });

  return User;
};
