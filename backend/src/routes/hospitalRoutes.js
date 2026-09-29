const express = require('express');
const controller = require('../controllers/hospitalController');
const { validate, schemas } = require('../validators');
const { authenticate, authorize } = require('../middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(authenticate, authorize(ROLES.HOSPITAL));

router.get('/dashboard', controller.dashboard);
router.get('/requests', controller.listRequests);
router.get('/requests/:id', controller.getRequest);
router.patch('/requests/:id/status', validate(schemas.updateRequestSchema), controller.updateStatus);

router.post('/verifications', validate(schemas.verificationSchema), controller.recordDonation);
router.get('/verifications', controller.listVerifications);

module.exports = router;
