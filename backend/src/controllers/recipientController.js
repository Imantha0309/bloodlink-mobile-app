const recipientService = require('../services/recipientService');
const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, created, paginated } = require('../utils/response');
const ApiError = require('../utils/ApiError');

const createRequest = asyncHandler(async (req, res) => {
  const { request, matches } = await recipientService.create(req.user.id, req.body);
  return created(res, { request, matchedDonors: matches.length }, 'Emergency request created');
});

const updateProfile = asyncHandler(async (req, res) =>
  success(res, await recipientService.updateProfile(req.user.id, req.body), 'Profile updated')
);

const listMyRequests = asyncHandler(async (req, res) => {
  const result = await recipientService.listForRecipient(req.user.id, req.query);
  return paginated(res, result);
});

const getRequest = asyncHandler(async (req, res) => success(res, await recipientService.getById(req.params.id)));

const getStatus = asyncHandler(async (req, res) => {
  const request = await recipientService.getById(req.params.id);
  if (request.recipientId !== req.user.id) throw ApiError.forbidden();
  const donors = await recipientService.acceptedDonors(request.id);
  return success(res, { request, acceptedDonors: donors });
});

const matchedDonors = asyncHandler(async (req, res) => {
  const rows = await recipientService.acceptedDonors(req.params.id);
  return success(res, rows);
});

const cancelRequest = asyncHandler(async (req, res) =>
  success(res, await recipientService.cancel(req.params.id, req.user.id), 'Request cancelled')
);

const updateRequest = asyncHandler(async (req, res) => success(res, await recipientService.updateStatus(req.params.id, req.body)));

const listNotifications = asyncHandler(async (req, res) => {
  const rows = await notificationService.listForUser(req.user.id, {
    unreadOnly: req.query.unreadOnly === 'true',
    limit: req.query.limit,
  });
  return success(res, rows);
});

const markRead = asyncHandler(async (req, res) => success(res, await notificationService.markRead(req.user.id, req.params.id)));

const markAllRead = asyncHandler(async (req, res) => {
  const count = await notificationService.markAllRead(req.user.id);
  return success(res, { updated: count });
});

module.exports = {
  createRequest,
  updateProfile,
  listMyRequests,
  getRequest,
  getStatus,
  matchedDonors,
  cancelRequest,
  updateRequest,
  listNotifications,
  markRead,
  markAllRead,
};
