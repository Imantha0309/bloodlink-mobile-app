const express = require('express');
const controller = require('../controllers/donorController');
const { validate, schemas } = require('../validators');
const { authenticate, authorize } = require('../middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(authenticate, authorize(ROLES.DONOR));

router.get('/profile', controller.getProfile);
router.patch('/profile', validate(schemas.profileSchema), controller.updateProfile);
router.put('/availability', validate(schemas.availabilitySchema), controller.setAvailability);

router.get('/requests', controller.matchedRequests);
router.get('/requests/:id', controller.getRequest);
router.post('/requests/:id/respond', validate(schemas.donorResponseSchema), controller.respond);

router.get('/notifications', controller.listNotifications);

module.exports = router;
