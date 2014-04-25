"use strict";

module.exports = function(sequelize, DataTypes) {
  var Token = sequelize.define('Token', {
    domain: DataTypes.STRING,
    token: DataTypes.STRING
  }, {
    underscored: true,
    
    associate: function(models) {
      Token.belongsTo(models.User);
    }
  });

  return Token;
};
