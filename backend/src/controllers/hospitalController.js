const hospitalService = require('../services/hospitalService');
const recipientService = require('../services/recipientService');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, created, paginated } = require('../utils/response');

const dashboard = asyncHandler(async (req, res) => success(res, await hospitalService.dashboard()));

const listRequests = asyncHandler(async (req, res) => {
  const result = await recipientService.listAll(req.query);
  return paginated(res, result);
});

const getRequest = asyncHandler(async (req, res) => success(res, await recipientService.getById(req.params.id)));

const updateStatus = asyncHandler(async (req, res) =>
  success(res, await recipientService.updateStatus(req.params.id, req.body), 'Request updated')
);

const recordDonation = asyncHandler(async (req, res) => {
  const record = await hospitalService.recordDonation({
    hospitalUserId: req.user.id,
    donationId: req.body.donationId,
    status: req.body.status,
    remarks: req.body.remarks,
  });
  return created(res, record, 'Donation recorded');
});

const listVerifications = asyncHandler(async (req, res) => {
  const result = await hospitalService.listVerifications(req.query);
  return paginated(res, result);
});

module.exports = { dashboard, listRequests, getRequest, updateStatus, recordDonation, listVerifications };
