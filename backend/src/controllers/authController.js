const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, created } = require('../utils/response');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return created(res, { user: result.user, token: result.token }, 'Account created');
});

const login = asyncHandler(async (req, res) => {
  const { user, profile, token } = await authService.login(req.body);
  return success(res, { user, profile, token });
});

const me = asyncHandler(async (req, res) => {
  const { user, profile } = await authService.me(req.user.id);
  return success(res, { user, profile });
});

module.exports = { register, login, me };
