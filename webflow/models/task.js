"use strict";

module.exports = function(sequelize, DataTypes) {
  var Task = sequelize.define('Task', {
    title: DataTypes.STRING
  }, {
    underscored: true,
    
    associate: function(models) {
      Task.belongsTo(models.User);
    }
  });

  return Task;
};
