const config = require('./env');

module.exports = {
  development: {
    ...config.db,
    dialectOptions: { decimalNumbers: true },
  },
  test: {
    ...config.db,
    database: `${config.db.name}_test`,
    logging: false,
  },
  production: {
    ...config.db,
    dialectOptions: { decimalNumbers: true },
    pool: { max: 20, min: 0, acquire: 30000, idle: 10000 },
  },
};
