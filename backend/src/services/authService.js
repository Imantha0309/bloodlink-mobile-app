const jwtService = require('../middleware/auth');
const { Op } = require('sequelize');
const { User, DonorProfile, RecipientProfile, Hospital } = require('../models');
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../config/constants');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Digits (and a leading +) only, so "+27 82-123-4567" becomes "+27821234567".
const normalisePhone = (value) => {
  const trimmed = String(value).trim();
  const digits = trimmed.replace(/[^0-9]/g, '');
  return trimmed.startsWith('+') ? `+${digits}` : digits;
};

// Phone numbers are stored normalised, so we only need to try the canonical
// form plus the raw input in case of legacy rows.
const loginCandidates = (identifier) => {
  const raw = String(identifier).trim();
  if (EMAIL_RE.test(raw)) return [{ email: raw.toLowerCase() }];
  const normalised = normalisePhone(raw);
  return normalised === raw ? [{ phone: normalised }] : [{ phone: normalised }, { phone: raw }];
};

const profileModelFor = (role) => {
  if (role === ROLES.DONOR) return DonorProfile;
  if (role === ROLES.RECIPIENT) return RecipientProfile;
  if (role === ROLES.HOSPITAL) return Hospital;
  return null;
};

const buildProfile = (role, payload) => {
  const common = {
    bloodGroup: payload.bloodGroup || null,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    address: payload.address || null,
  };
  if (role === ROLES.HOSPITAL) {
    return { name: payload.hospitalName, registrationNumber: payload.registrationNumber || `REG-${Date.now()}` };
  }
  return common;
};

const register = async ({ name, email, phone, password, role, ...rest }) => {
  const normalisedEmail = String(email).toLowerCase();
  const normalisedPhone = normalisePhone(phone);

  const existing = await User.findOne({
    where: { [Op.or]: [{ email: normalisedEmail }, { phone: normalisedPhone }] },
  });
  if (existing) {
    throw ApiError.conflict(
      existing.email === normalisedEmail ? 'Email already registered' : 'Phone number already registered'
    );
  }

  const user = await User.create({
    name,
    email: normalisedEmail,
    phone: normalisedPhone,
    passwordHash: require('bcryptjs').hashSync(password, require('../config/env').bcryptRounds),
    role,
  });

  const Model = profileModelFor(role);
  if (Model) await Model.create({ userId: user.id, ...buildProfile(role, rest) });

  return { user, token: jwtService.signToken(user) };
};

const login = async ({ identifier, email, password }) => {
  const value = identifier !== undefined && String(identifier).trim() !== '' ? identifier : email;
  if (value === undefined || String(value).trim() === '') {
    throw ApiError.badRequest('Email or phone is required');
  }

  const user = await User.findOne({ where: { [Op.or]: loginCandidates(value) } });
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const match = await require('bcryptjs').compare(password, user.passwordHash);
  if (!match) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.forbidden('Account is disabled');

  const Model = profileModelFor(user.role);
  const profile = Model ? await Model.findOne({ where: { userId: user.id } }) : null;

  return { user, profile, token: jwtService.signToken(user) };
};

const me = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw ApiError.notFound('User not found');
  const Model = profileModelFor(user.role);
  const profile = Model ? await Model.findOne({ where: { userId } }) : null;
  return { user, profile };
};

module.exports = { register, login, me };
