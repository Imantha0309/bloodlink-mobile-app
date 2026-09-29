// Accepts (res, data), (res, data, message) or (res, data, statusCode, message).
const success = (res, data, statusCode, message) => {
  let code = statusCode;
  let msg = message;
  if (typeof code !== 'number') {
    msg = code;
    code = 200;
  }
  return res.status(code).json({ success: true, ...(msg && { message: msg }), data });
};

const created = (res, data, message) => success(res, data, 201, message);

const paginated = (res, { rows, count, page, limit }) =>
  res.json({
    success: true,
    data: rows,
    meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  });

module.exports = { success, created, paginated };
