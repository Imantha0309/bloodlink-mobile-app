const router = require('express').Router();
const auth = require('../controllers/authController');
const { validate, schemas } = require('../validators');
const { authenticate, authorize, authLimiter } = require('../middleware');
const { ROLES } = require('../config/constants');

router.post('/register', authLimiter, validate(schemas.registerSchema), auth.register);
router.post('/login', authLimiter, validate(schemas.loginSchema), auth.login);
router.get('/me', authenticate, auth.me);

module.exports = { router, authorize, ROLES };
