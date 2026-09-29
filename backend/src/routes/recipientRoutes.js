const express = require('express');
const controller = require('../controllers/recipientController');
const { validate, schemas } = require('../validators');
const { authenticate, authorize, emergencyLimiter } = require('../middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(authenticate, authorize(ROLES.RECIPIENT));

router.patch('/profile', validate(schemas.profileSchema), controller.updateProfile);

router.post('/requests', emergencyLimiter, validate(schemas.createRequestSchema), controller.createRequest);
router.get('/requests', controller.listMyRequests);
router.get('/requests/:id', controller.getRequest);
router.get('/requests/:id/status', controller.getStatus);
router.get('/requests/:id/donors', controller.matchedDonors);
router.patch('/requests/:id', validate(schemas.updateRequestSchema), controller.updateRequest);
router.post('/requests/:id/cancel', controller.cancelRequest);

router.get('/notifications', controller.listNotifications);
router.patch('/notifications/:id/read', controller.markRead);
router.post('/notifications/read-all', controller.markAllRead);

module.exports = router;
