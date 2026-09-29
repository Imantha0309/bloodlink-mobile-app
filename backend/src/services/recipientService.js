const { Op } = require('sequelize');
const { BloodRequest, DonorResponse, User, Hospital, DonorProfile, RecipientProfile } = require('../models');
const { REQUEST_STATUS, DONOR_RESPONSE } = require('../config/constants');
const { paginate } = require('../utils/helpers');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notificationService');
const donorService = require('./donorService');

const DEFAULT_TTL_HOURS = { critical: 6, high: 12, medium: 24, low: 48 };

const updateProfile = async (userId, { bloodGroup, address, latitude, longitude }) => {
  const profile = await RecipientProfile.findOne({ where: { userId } });
  if (!profile) throw ApiError.notFound('Recipient profile not found');
  await profile.update({
    ...(bloodGroup ? { bloodGroup } : {}),
    ...(address !== undefined ? { address } : {}),
    ...(latitude !== undefined ? { latitude } : {}),
    ...(longitude !== undefined ? { longitude } : {}),
  });
  return profile;
};

const create = async (recipientId, payload) => {
  const request = await BloodRequest.create({
    ...payload,
    recipientId,
    expiresAt: new Date(Date.now() + (DEFAULT_TTL_HOURS[payload.urgency] || 24) * 3600 * 1000),
  });

  const matches = await donorService.runMatching(request.id);
  const updated = await BloodRequest.findByPk(request.id);
  return { request: updated, matches };
};

const listForRecipient = async (recipientId, { status, page, limit } = {}) => {
  const { page: p, limit: l, offset } = paginate({ page, limit });
  return BloodRequest.findAndCountAll({
    where: { recipientId, ...(status ? { status } : {}) },
    order: [['createdAt', 'DESC']],
    limit: l,
    offset,
  }).then(({ rows, count }) => ({ rows, count, page: p, limit: l }));
};

const listAll = async ({ status, bloodGroup, page, limit } = {}) => {
  const { page: p, limit: l, offset } = paginate({ page, limit });
  return BloodRequest.findAndCountAll({
    where: {
      ...(status ? { status } : {}),
      ...(bloodGroup ? { bloodGroup } : {}),
    },
    include: [{ model: User, as: 'recipient', attributes: ['id', 'name', 'phone'] }],
    order: [['createdAt', 'DESC']],
    limit: l,
    offset,
  }).then(({ rows, count }) => ({ rows, count, page: p, limit: l }));
};

const getById = async (id) => {
  const request = await BloodRequest.findByPk(id, {
    include: [{ model: Hospital, as: 'hospital' }],
  });
  if (!request) throw ApiError.notFound('Request not found');
  return request;
};

const responses = async (id) => {
  await getById(id);
  return DonorResponse.findAll({
    where: { requestId: id },
    include: [
      {
        model: DonorProfile,
        as: 'donor',
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone'] }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const acceptedDonors = async (id) => {
  const rows = await DonorResponse.findAll({
    where: { requestId: id, response: DONOR_RESPONSE.ACCEPTED },
    include: [
      {
        model: DonorProfile,
        as: 'donor',
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone'] }],
      },
    ],
  });
  return rows;
};

const updateStatus = async (id, { status, hospitalId, unitsRequired }) => {
  const request = await getById(id);
  const patch = {};
  if (status) patch.status = status;
  if (hospitalId) patch.hospitalId = hospitalId;
  if (unitsRequired) patch.unitsRequired = unitsRequired;
  await request.update(patch);

  await notificationService.push({
    userId: request.recipientId,
    title: 'Request updated',
    body: `Your request is now ${patch.status || request.status}.`,
    data: { requestId: id, type: 'REQUEST_UPDATED' },
  });
  return request;
};

const cancel = async (id, recipientId) => {
  const request = await getById(id);
  if (request.recipientId !== recipientId) throw ApiError.forbidden();
  if (request.status === REQUEST_STATUS.FULFILLED) throw ApiError.conflict('Request already fulfilled');
  return updateStatus(id, { status: REQUEST_STATUS.CANCELLED });
};

const expireStale = async () => {
  const [count] = await BloodRequest.update(
    { status: REQUEST_STATUS.EXPIRED },
    { where: { status: { [Op.in]: [REQUEST_STATUS.PENDING, REQUEST_STATUS.MATCHING] }, expiresAt: { [Op.lt]: new Date() } } }
  );
  return count;
};

module.exports = {
  create,
  updateProfile,
  listForRecipient,
  listAll,
  getById,
  responses,
  acceptedDonors,
  updateStatus,
  cancel,
  expireStale,
};
