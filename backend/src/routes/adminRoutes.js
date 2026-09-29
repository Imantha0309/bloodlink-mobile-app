const express = require('express');
const controller = require('../controllers/adminController');
const { validate, schemas } = require('../validators');
const { authenticate, authorize } = require('../middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/stats', controller.stats);

router.get('/users', controller.listUsers);
router.patch('/users/:id/status', controller.setActive);
router.delete('/users/:id', controller.removeUser);
router.get('/hospitals', controller.listHospitals);
router.patch('/hospitals/:id/verify', controller.verifyHospital);

router.get('/requests', controller.listRequests);
router.patch('/requests/:id', validate(schemas.updateRequestSchema), controller.updateRequest);

router.get('/verifications', controller.listVerifications);

router.get('/settings', controller.listSettings);
router.put('/settings/:key', controller.upsertSetting);
router.delete('/settings/:key', controller.removeSetting);

module.exports = router;
