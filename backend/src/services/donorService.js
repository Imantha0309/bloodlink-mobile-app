const { Op } = require('sequelize');
const { DonorProfile, DonorResponse, BloodRequest, User } = require('../models');
const { compatibleGroups } = require('./matchingService');
const { distanceKm } = require('../utils/helpers');
const { DONOR_RESPONSE, REQUEST_STATUS, URGENCY_LEVELS } = require('../config/constants');
const notificationService = require('./notificationService');
const ApiError = require('../utils/ApiError');

const URGENCY_RANK = {
  [URGENCY_LEVELS.CRITICAL]: 0,
  [URGENCY_LEVELS.HIGH]: 1,
  [URGENCY_LEVELS.MEDIUM]: 2,
  [URGENCY_LEVELS.LOW]: 3,
};

const findMatchingDonors = async (request, { radiusKm = 50, limit = 25 } = {}) => {
  const groups = compatibleGroups(request.bloodGroup);
  if (!groups.length) return [];

  const where = { bloodGroup: groups, isAvailable: true };
  if (request.latitude != null && request.longitude != null) {
    const latDelta = radiusKm / 111;
    const lonDelta = radiusKm / (111 * Math.cos((Number(request.latitude) * Math.PI) / 180) || 1);
    where.latitude = { [Op.between]: [Number(request.latitude) - latDelta, Number(request.latitude) + latDelta] };
    where.longitude = { [Op.between]: [Number(request.longitude) - lonDelta, Number(request.longitude) + lonDelta] };
  }

  const donors = await DonorProfile.findAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone'] }],
    limit: limit * 3,
  });

  return donors
    .map((donor) => ({
      donor,
      distance: distanceKm(request.latitude, request.longitude, donor.latitude, donor.longitude),
    }))
    .filter((entry) => (request.latitude == null || entry.distance === null ? true : entry.distance <= radiusKm))
    .sort((a, b) => {
      const lastDonationDelta = new Date(a.donor.lastDonationDate || 0) - new Date(b.donor.lastDonationDate || 0);
      if (lastDonationDelta !== 0) return lastDonationDelta;
      return (a.distance ?? Infinity) - (b.distance ?? Infinity);
    })
    .slice(0, limit)
    .map((entry) => ({
      donorId: entry.donor.id,
      userId: entry.donor.userId,
      name: entry.donor.user.name,
      phone: entry.donor.user.phone,
      bloodGroup: entry.donor.bloodGroup,
      distanceKm: entry.distance,
      lastDonationDate: entry.donor.lastDonationDate,
      totalDonations: entry.donor.totalDonations,
      response: DONOR_RESPONSE.PENDING,
    }));
};

const notifyMatchedDonors = async (request, matches) => {
  await Promise.all(
    matches.map((m) =>
      notificationService.push({
        userId: m.userId,
        title: `Urgent ${request.bloodGroup} blood request`,
        body: `A ${request.urgency} request near you needs ${request.unitsRequired} unit(s).`,
        data: { requestId: request.id, type: 'BLOOD_REQUEST' },
      }).catch(() => null)
    )
  );
};

const createResponses = async (request, matches) => {
  await Promise.all(
    matches.map((m) =>
      DonorResponse.findOrCreate({
        where: { requestId: request.id, donorId: m.donorId },
        defaults: { distanceKm: m.distanceKm },
      })
    )
  );
  await BloodRequest.update({ status: REQUEST_STATUS.MATCHING }, { where: { id: request.id } });
};

const runMatching = async (requestId, options) => {
  const request = await BloodRequest.findByPk(requestId);
  if (!request) throw ApiError.notFound('Request not found');

  const matches = await findMatchingDonors(request, options);
  await createResponses(request, matches);
  await notifyMatchedDonors(request, matches);
  return matches;
};

const respond = async ({ requestId, donorId, response }) => {
  const record = await DonorResponse.findOne({ where: { requestId, donorId } });
  if (!record) throw ApiError.notFound('You were not matched to this request');
  if (record.response !== DONOR_RESPONSE.PENDING) throw ApiError.conflict('You already responded to this request');

  record.response = response;
  record.respondedAt = new Date();
  await record.save();

  if (response === DONOR_RESPONSE.ACCEPTED) {
    const request = await BloodRequest.findByPk(requestId);
    await notificationService.push({
      userId: request.recipientId,
      title: 'Donor accepted your request',
      body: 'A matched donor accepted your blood request.',
      data: { requestId, type: 'DONOR_ACCEPTED' },
    });
  }
  return record;
};

const listForDonor = async (donorId, { status } = {}) =>
  DonorResponse.findAll({
    where: { donorId, ...(status ? { response: status } : {}) },
    include: [{ model: BloodRequest, as: 'request' }],
    order: [['createdAt', 'DESC']],
  });

const pendingForDonor = async (donorId) =>
  DonorResponse.findAll({
    where: { donorId, response: DONOR_RESPONSE.PENDING },
    include: [{ model: BloodRequest, as: 'request' }],
    order: [['createdAt', 'DESC']],
  });

module.exports = {
  findMatchingDonors,
  runMatching,
  respond,
  listForDonor,
  pendingForDonor,
  URGENCY_RANK,
};
