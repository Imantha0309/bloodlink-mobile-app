const { DataTypes } = require('sequelize');
const { DONOR_RESPONSE } = require('../config/constants');

module.exports = (sequelize) => {
  const DonorResponse = sequelize.define('DonorResponse', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    requestId: { type: DataTypes.INTEGER, allowNull: false },
    donorId: { type: DataTypes.INTEGER, allowNull: false },
    response: {
      type: DataTypes.ENUM(...Object.values(DONOR_RESPONSE)),
      allowNull: false,
      defaultValue: DONOR_RESPONSE.PENDING,
    },
    distanceKm: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    respondedAt: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'donor_responses',
    indexes: [
      { unique: true, fields: ['request_id', 'donor_id'] },
      { fields: ['donor_id'] },
    ],
  });

  return DonorResponse;
};
