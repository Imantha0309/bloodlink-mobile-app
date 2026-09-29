const createApp = require('./app');
const config = require('./config/env');
const { connectDB } = require('./config/sequelize');

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`[api] Bloodlink listening on http://localhost:${config.port} (${config.env})`);
  });

  const shutdown = (signal) => {
    console.log(`\n[api] ${signal} received, closing server`);
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start();
