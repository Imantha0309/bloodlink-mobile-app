require('dotenv').config();

const toBool = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),

  db: {
    dialect: process.env.DB_DIALECT || 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'bloodlink',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    storage: process.env.DB_STORAGE || './bloodlink.sqlite',
    logging: toBool(process.env.DB_LOGGING, false),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20', 10),
  },

  corsOrigin: process.env.CORS_ORIGIN || '*',

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxSizeBytes: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '5', 10) * 1024 * 1024,
  },
};

module.exports = config;
