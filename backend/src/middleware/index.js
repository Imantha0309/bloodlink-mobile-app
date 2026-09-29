const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const { ROLES } = require('../config/constants');

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts' },
});

const emergencyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Emergency request limit reached, contact support' },
});

const authorize = require('./auth').authorize;
const { authenticate, loadRoleProfile } = require('./auth');

module.exports = {
  apiLimiter,
  authLimiter,
  emergencyLimiter,
  authenticate,
  authorize,
  loadRoleProfile,
  roles: ROLES,
};
