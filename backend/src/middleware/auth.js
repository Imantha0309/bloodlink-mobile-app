const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { User, ROLED_MODELS } = require('../models');
const ApiError = require('../utils/ApiError');

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

const verifyToken = (token) => jwt.verify(token, config.jwt.secret);

const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized('Missing bearer token');

    const payload = verifyToken(token);
    const user = await User.findByPk(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized('Account is inactive or missing');

    req.user = user;
    next();
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.unauthorized('Invalid or expired token'));
  }
};

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (roles.length && !roles.includes(req.user.role)) return next(ApiError.forbidden());
  return next();
};

const loadRoleProfile = async (req, _res, next) => {
  try {
    const Model = ROLED_MODELS[req.user.role];
    if (!Model) return next();
    req.profile = (await Model.findOne({ where: { userId: req.user.id } })) || null;
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { signToken, verifyToken, authenticate, authorize, loadRoleProfile };
