const express = require('express');
const authRoutes = require('./authRoutes');
const recipientRoutes = require('./recipientRoutes');
const donorRoutes = require('./donorRoutes');
const hospitalRoutes = require('./hospitalRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

const health = (_req, res) =>
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime(), env: process.env.NODE_ENV } });

router.get('/health', health);
router.use('/auth', authRoutes.router);
router.use('/recipient', recipientRoutes);
router.use('/donor', donorRoutes);
router.use('/hospital', hospitalRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
