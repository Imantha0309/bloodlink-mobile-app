const { Sequelize } = require('sequelize');
const envConfig = require('./env');

const sequelize = new Sequelize(
  envConfig.db.name,
  envConfig.db.user,
  envConfig.db.password,
  {
    host: envConfig.db.host,
    port: envConfig.db.port,
    dialect: envConfig.db.dialect,
    ...(envConfig.db.dialect === 'sqlite' ? { storage: envConfig.db.storage } : {}),
    logging: envConfig.db.logging ? console.log : false,
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

const connectDB = async () => {
  await sequelize.authenticate();
  console.log(`[db] connected to ${envConfig.db.dialect}://${envConfig.db.host}:${envConfig.db.port}/${envConfig.db.name}`);
  return sequelize;
};

module.exports = { sequelize, connectDB };
