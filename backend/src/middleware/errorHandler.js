const ApiError = require('../utils/ApiError');

const notFound = (req, _res, next) => next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const body = {
    success: false,
    message: err.message || 'Internal server error',
  };

  if (err.details) body.errors = err.details;
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ success: false, message: 'Duplicate record', errors: err.errors?.map((e) => e.message) });
  }
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors.map((e) => e.message) });
  }
  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
    if (process.env.NODE_ENV === 'production') body.message = 'Internal server error';
  }

  return res.status(statusCode).json(body);
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { notFound, errorHandler, asyncHandler };
