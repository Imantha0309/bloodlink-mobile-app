const { DataTypes } = require('sequelize');
const { REQUEST_STATUS, URGENCY_LEVELS } = require('../config/constants');

module.exports = (sequelize) => {
  const BloodRequest = sequelize.define('BloodRequest', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    recipientId: { type: DataTypes.INTEGER, allowNull: false },
    hospitalId: { type: DataTypes.INTEGER, allowNull: true },
    bloodGroup: { type: DataTypes.STRING(3), allowNull: false },
    unitsRequired: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    urgency: {
      type: DataTypes.ENUM(...Object.values(URGENCY_LEVELS)),
      allowNull: false,
      defaultValue: URGENCY_LEVELS.MEDIUM,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(REQUEST_STATUS)),
      allowNull: false,
      defaultValue: REQUEST_STATUS.PENDING,
    },
    patientName: { type: DataTypes.STRING(120), allowNull: true },
    patientAge: { type: DataTypes.INTEGER, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'blood_requests',
    indexes: [
      { fields: ['blood_group', 'status'] },
      { fields: ['recipient_id'] },
      { fields: ['urgency'] },
    ],
  });

  return BloodRequest;
};
