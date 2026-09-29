const { User, DonorProfile, RecipientProfile, Hospital, BloodRequest, AppSetting, Verification } = require('../models');
const { ROLES } = require('../config/constants');
const { paginate } = require('../utils/helpers');
const ApiError = require('../utils/ApiError');

const listUsers = async ({ role, search, page, limit } = {}) => {
  const { page: p, limit: l, offset } = paginate({ page, limit });
  const { Op } = require('sequelize');
  const where = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
          ],
        }
      : {}),
  };

  return User.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit: l, offset })
    .then(({ rows, count }) => ({ rows, count, page: p, limit: l }));
};

const setActive = async (id, isActive) => {
  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === ROLES.ADMIN) throw ApiError.forbidden('Cannot modify admin accounts');
  await user.update({ isActive });
  return user;
};

const remove = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === ROLES.ADMIN) throw ApiError.forbidden('Cannot delete admin accounts');
  await user.destroy();
  return { id: Number(id) };
};

const verifyHospital = async (id, isVerified) => {
  const hospital = await Hospital.findByPk(id);
  if (!hospital) throw ApiError.notFound('Hospital not found');
  await hospital.update({ isVerified });
  await User.update({ verificationStatus: isVerified ? 'approved' : 'rejected' }, { where: { id: hospital.userId } });
  return hospital;
};

const listHospitals = async ({ search, page, limit } = {}) => {
  const { page: p, limit: l, offset } = paginate({ page, limit });
  const { Op } = require('sequelize');
  return Hospital.findAndCountAll({
    where: search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { registrationNumber: { [Op.like]: `%${search}%` } },
          ],
        }
      : {},
    include: [{ model: User, as: 'user', attributes: ['id', 'email', 'phone', 'isActive'] }],
    order: [['createdAt', 'DESC']],
    limit: l,
    offset,
  }).then(({ rows, count }) => ({ rows, count, page: p, limit: l }));
};

const stats = async () => {
  const byRole = await User.findAll({
    attributes: ['role', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total']],
    group: ['role'],
    raw: true,
  });
  const [requests, availableDonors, donorProfiles, recipientProfiles] = await Promise.all([
    BloodRequest.count(),
    DonorProfile.count({ where: { isAvailable: true } }),
    DonorProfile.count(),
    RecipientProfile.count(),
  ]);
  return { byRole, requests, availableDonors, donorProfiles, recipientProfiles };
};

const listSettings = async () => AppSetting.findAll({ order: [['key', 'ASC']] });

const upsertSetting = async (key, value, description) => {
  const [setting] = await AppSetting.findOrCreate({ where: { key }, defaults: { value, description: description || null } });
  await setting.update({ value, ...(description ? { description } : {}) });
  return setting;
};

const removeSetting = async (key) => {
  const count = await AppSetting.destroy({ where: { key } });
  if (!count) throw ApiError.notFound('Setting not found');
  return { key };
};

module.exports = {
  listUsers,
  setActive,
  remove,
  verifyHospital,
  listHospitals,
  stats,
  listSettings,
  upsertSetting,
  removeSetting,
};
