const express = require('express');
const controller = require('../controllers/notificationController');
const { authenticate } = require('../middleware');

const router = express.Router();
router.use(authenticate);

router.get('/', controller.list);
router.get('/unread-count', controller.unreadCount);
router.patch('/:id/read', controller.markRead);
router.post('/read-all', controller.markAllRead);

module.exports = router;
