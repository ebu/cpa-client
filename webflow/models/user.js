"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    provider_uid: DataTypes.STRING,
    username: DataTypes.STRING
  }, {
    underscored: true,

    associate: function(models) {
      User.hasMany(models.Token);
    }
  });

  return User;
};
