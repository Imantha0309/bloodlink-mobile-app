const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RecipientProfile = sequelize.define('RecipientProfile', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    bloodGroup: { type: DataTypes.STRING(3), allowNull: true },
    latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    address: { type: DataTypes.STRING(255), allowNull: true },
  }, { tableName: 'recipient_profiles' });

  return RecipientProfile;
};
