const { DataTypes } = require('sequelize');
const { VERIFICATION_STATUS } = require('../config/constants');

module.exports = (sequelize) => {
  const Verification = sequelize.define('Verification', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    donorId: { type: DataTypes.INTEGER, allowNull: true },
    hospitalId: { type: DataTypes.INTEGER, allowNull: false },
    donationId: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    status: {
      type: DataTypes.ENUM(...Object.values(VERIFICATION_STATUS)),
      allowNull: false,
      defaultValue: VERIFICATION_STATUS.PENDING,
    },
    verifiedAt: { type: DataTypes.DATE, allowNull: true },
    remarks: { type: DataTypes.STRING(255), allowNull: true },
  }, {
    tableName: 'verifications',
    indexes: [{ fields: ['donor_id'] }, { fields: ['status'] }],
  });

  return Verification;
};
