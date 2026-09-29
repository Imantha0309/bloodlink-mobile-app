const adminService = require('../services/adminService');
const recipientService = require('../services/recipientService');
const hospitalService = require('../services/hospitalService');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, paginated } = require('../utils/response');
const { ROLES } = require('../config/constants');

const stats = asyncHandler(async (_req, res) => success(res, await adminService.stats()));

const listUsers = asyncHandler(async (req, res) => {
  const role = req.query.role;
  const result = await adminService.listUsers(req.query);
  return paginated(res, result);
});

const setActive = asyncHandler(async (req, res) =>
  success(res, await adminService.setActive(req.params.id, req.body.isActive))
);

const removeUser = asyncHandler(async (req, res) => success(res, await adminService.remove(req.params.id), 'User removed'));

const verifyHospital = asyncHandler(async (req, res) =>
  success(res, await adminService.verifyHospital(req.params.id, req.body.isVerified))
);

const listHospitals = asyncHandler(async (req, res) => {
  const result = await adminService.listHospitals(req.query);
  return paginated(res, result);
});

const listRequests = asyncHandler(async (req, res) => {
  const result = await recipientService.listAll(req.query);
  return paginated(res, result);
});

const updateRequest = asyncHandler(async (req, res) => success(res, await recipientService.updateStatus(req.params.id, req.body)));

const listVerifications = asyncHandler(async (req, res) => {
  const result = await hospitalService.listVerifications(req.query);
  return paginated(res, result);
});

const listSettings = asyncHandler(async (_req, res) => success(res, await adminService.listSettings()));

const upsertSetting = asyncHandler(async (req, res) =>
  success(res, await adminService.upsertSetting(req.params.key, req.body.value, req.body.description))
);

const removeSetting = asyncHandler(async (req, res) => success(res, await adminService.removeSetting(req.params.key)));

module.exports = {
  stats,
  listUsers,
  setActive,
  removeUser,
  verifyHospital,
  listHospitals,
  listRequests,
  updateRequest,
  listVerifications,
  listSettings,
  upsertSetting,
  removeSetting,
  roles: ROLES,
};
