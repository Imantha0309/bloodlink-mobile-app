const { Notification } = require('../models');

const push = async ({ userId, title, body, data = null }) =>
  Notification.create({ userId, title, body, data });

const broadcast = async (userIds, payload) =>
  Promise.all(userIds.map((userId) => push({ userId, ...payload })));

const listForUser = async (userId, { unreadOnly = false, limit = 50 } = {}) =>
  Notification.findAll({
    where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
    order: [['createdAt', 'DESC']],
    limit,
  });

const markRead = async (userId, id) => {
  const [count] = await Notification.update({ isRead: true }, { where: { id, userId } });
  if (!count) throw require('../utils/ApiError').notFound('Notification not found');
  return Notification.findByPk(id);
};

const markAllRead = async (userId) => Notification.update({ isRead: true }, { where: { userId } });

const unreadCount = async (userId) => Notification.count({ where: { userId, isRead: false } });

module.exports = { push, broadcast, listForUser, markRead, markAllRead, unreadCount };
