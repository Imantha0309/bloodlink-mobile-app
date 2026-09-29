const { Verification, DonorProfile, User, Hospital, BloodRequest } = require('../models');
const { VERIFICATION_STATUS, REQUEST_STATUS } = require('../config/constants');
const { paginate } = require('../utils/helpers');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notificationService');

const recordDonation = async ({ hospitalUserId, donationId, status = VERIFICATION_STATUS.APPROVED, remarks }) => {
  const hospital = await Hospital.findOne({ where: { userId: hospitalUserId } });
  if (!hospital) throw ApiError.notFound('Hospital profile not found');

  const existing = await Verification.findOne({ where: { donationId } });
  if (existing) throw ApiError.conflict('Donation ID already recorded');

  const record = await Verification.create({
    donorId: null,
    hospitalId: hospital.id,
    donationId,
    status,
    remarks: remarks || null,
    verifiedAt: new Date(),
  });

  const donorUserId = Number(donationId);
  const donor = Number.isInteger(donorUserId)
    ? await DonorProfile.findOne({ where: { userId: donorUserId } })
    : null;

  if (donor) {
    record.donorId = donor.id;
    await record.save();

    if (status === VERIFICATION_STATUS.APPROVED) {
      donor.lastDonationDate = new Date().toISOString().slice(0, 10);
      donor.totalDonations += 1;
      await donor.save();

      await notificationService.push({
        userId: donor.userId,
        title: 'Donation verified',
        body: 'Your donation has been verified by the hospital.',
        data: { verificationId: record.id, type: 'DONATION_VERIFIED' },
      });
    }
  }

  return record;
};

const listVerifications = async ({ status, page, limit } = {}) => {
  const { page: p, limit: l, offset } = paginate({ page, limit });
  return Verification.findAndCountAll({
    where: status ? { status } : {},
    include: [{ model: Hospital, as: 'hospital', attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
    limit: l,
    offset,
  }).then(({ rows, count }) => ({ rows, count, page: p, limit: l }));
};

const dashboard = async () => {
  const [totalRequests, pending, fulfilled, availableDonors, users, hospitals] = await Promise.all([
    BloodRequest.count(),
    BloodRequest.count({ where: { status: REQUEST_STATUS.MATCHING } }),
    BloodRequest.count({ where: { status: REQUEST_STATUS.FULFILLED } }),
    DonorProfile.count({ where: { isAvailable: true } }),
    User.count(),
    Hospital.count(),
  ]);
  return { totalRequests, pending, fulfilled, availableDonors, users, hospitals };
};

module.exports = { recordDonation, listVerifications, dashboard };
