const { DataTypes } = require('sequelize');
const { ROLES, VERIFICATION_STATUS } = require('../config/constants');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(160), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM(...Object.values(ROLES)),
      allowNull: false,
      defaultValue: ROLES.RECIPIENT,
    },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    verificationStatus: {
      type: DataTypes.ENUM(...Object.values(VERIFICATION_STATUS)),
      allowNull: false,
      defaultValue: VERIFICATION_STATUS.PENDING,
    },
  }, {
    tableName: 'users',
    indexes: [{ unique: true, fields: ['email'] }, { fields: ['role'] }],
  });

  User.prototype.toJSON = function toJSON() {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
  };

  return User;
};
