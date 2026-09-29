const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AppSetting = sequelize.define('AppSetting', {
    key: { type: DataTypes.STRING(80), primaryKey: true },
    value: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },
  }, { tableName: 'app_settings', timestamps: false });

  return AppSetting;
};
