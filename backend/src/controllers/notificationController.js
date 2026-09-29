const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../middleware/errorHandler');
const { success } = require('../utils/response');

const list = asyncHandler(async (req, res) => {
  const rows = await notificationService.listForUser(req.user.id, {
    unreadOnly: req.query.unreadOnly === 'true',
    limit: req.query.limit,
  });
  return success(res, rows);
});

const unreadCount = asyncHandler(async (req, res) =>
  success(res, { count: await notificationService.unreadCount(req.user.id) })
);

const markRead = asyncHandler(async (req, res) => success(res, await notificationService.markRead(req.user.id, req.params.id)));

const markAllRead = asyncHandler(async (req, res) => {
  const updated = await notificationService.markAllRead(req.user.id);
  return success(res, { updated });
});

module.exports = { list, unreadCount, markRead, markAllRead };
