const { ROLES } = require('../config/constants');
const { sequelize } = require('../config/sequelize');

const User = require('./user')(sequelize);
const DonorProfile = require('./donorProfile')(sequelize);
const RecipientProfile = require('./recipientProfile')(sequelize);
const Hospital = require('./hospital')(sequelize);
const BloodRequest = require('./bloodRequest')(sequelize);
const DonorResponse = require('./donorResponse')(sequelize);
const Verification = require('./verification')(sequelize);
const Notification = require('./notification')(sequelize);
const AppSetting = require('./appSetting')(sequelize);

User.hasOne(DonorProfile, { foreignKey: 'userId', as: 'donorProfile', onDelete: 'CASCADE' });
DonorProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(RecipientProfile, { foreignKey: 'userId', as: 'recipientProfile', onDelete: 'CASCADE' });
RecipientProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Hospital, { foreignKey: 'userId', as: 'hospital', onDelete: 'CASCADE' });
Hospital.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(BloodRequest, { foreignKey: 'recipientId', as: 'requests' });
BloodRequest.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

Hospital.hasMany(BloodRequest, { foreignKey: 'hospitalId', as: 'requests' });
BloodRequest.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });

BloodRequest.hasMany(DonorResponse, { foreignKey: 'requestId', as: 'responses', onDelete: 'CASCADE' });
DonorResponse.belongsTo(BloodRequest, { foreignKey: 'requestId', as: 'request' });

DonorProfile.hasMany(DonorResponse, { foreignKey: 'donorId', as: 'responses' });
DonorResponse.belongsTo(DonorProfile, { foreignKey: 'donorId', as: 'donor' });

DonorProfile.hasMany(Verification, { foreignKey: 'donorId', as: 'verifications' });
Verification.belongsTo(DonorProfile, { foreignKey: 'donorId', as: 'donor' });

Hospital.hasMany(Verification, { foreignKey: 'hospitalId', as: 'verifications' });
Verification.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

const models = {
  User,
  DonorProfile,
  RecipientProfile,
  Hospital,
  BloodRequest,
  DonorResponse,
  Verification,
  Notification,
  AppSetting,
};

const ROLED_MODELS = {
  [ROLES.DONOR]: DonorProfile,
  [ROLES.RECIPIENT]: RecipientProfile,
  [ROLES.HOSPITAL]: Hospital,
};

module.exports = { ...models, sequelize, ROLED_MODELS };
