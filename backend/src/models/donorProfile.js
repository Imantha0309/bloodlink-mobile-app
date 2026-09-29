const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DonorProfile = sequelize.define('DonorProfile', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    bloodGroup: { type: DataTypes.STRING(3), allowNull: false },
    isAvailable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    lastDonationDate: { type: DataTypes.DATEONLY, allowNull: true },
    totalDonations: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    address: { type: DataTypes.STRING(255), allowNull: true },
  }, { tableName: 'donor_profiles' });

  return DonorProfile;
};
