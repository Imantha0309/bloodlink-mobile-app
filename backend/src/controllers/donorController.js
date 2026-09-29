const donorService = require('../services/donorService');
const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../middleware/errorHandler');
const { success } = require('../utils/response');
const ApiError = require('../utils/ApiError');
const { DonorProfile } = require('../models');
const { canDonateTo } = require('../services/matchingService');

const requireProfile = async (req) => {
  const profile = await DonorProfile.findOne({ where: { userId: req.user.id } });
  if (!profile) throw ApiError.notFound('Donor profile not found');
  return profile;
};

const setAvailability = asyncHandler(async (req, res) => {
  const profile = await requireProfile(req);
  await profile.update({ isAvailable: req.body.isAvailable });
  return success(res, profile, req.body.isAvailable ? 'You are now available to donate' : 'Availability turned off');
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await requireProfile(req);
  const { name, phone, ...rest } = req.body;
  if (name || phone) await req.user.update({ ...(name && { name }), ...(phone && { phone }) });
  await profile.update(rest);
  return success(res, profile);
});

const getProfile = asyncHandler(async (req, res) => success(res, await requireProfile(req)));

const matchedRequests = asyncHandler(async (req, res) => {
  const profile = await requireProfile(req);
  if (!profile.isAvailable) throw ApiError.conflict('Set your availability before viewing requests');
  const rows = await donorService.pendingForDonor(profile.id);
  return success(res, rows.filter((row) => row.request && canDonateTo(profile.bloodGroup, row.request.bloodGroup)));
});

const getRequest = asyncHandler(async (req, res) => {
  const profile = await requireProfile(req);
  const row = await donorService.listForDonor(profile.id);
  const match = row.find((r) => r.requestId === Number(req.params.id));
  if (!match) throw ApiError.forbidden('Not matched to this request');
  return success(res, match.request);
});

const respond = asyncHandler(async (req, res) => {
  const profile = await requireProfile(req);
  const record = await donorService.respond({
    requestId: Number(req.params.id),
    donorId: profile.id,
    response: req.body.response,
  });
  return success(res, record, 'Response recorded');
});

const listNotifications = asyncHandler(async (req, res) => {
  const rows = await notificationService.listForUser(req.user.id, {
    unreadOnly: req.query.unreadOnly === 'true',
    limit: req.query.limit,
  });
  return success(res, rows);
});

module.exports = { setAvailability, updateProfile, getProfile, matchedRequests, getRequest, respond, listNotifications };
