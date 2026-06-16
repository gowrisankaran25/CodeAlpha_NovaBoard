const successResponse = (res, data, statusCode = 200, message = "Success") => {
  return res.status(statusCode).json({ success: true, message, data });
};

const errorResponse = (res, message = "Internal server error", statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { successResponse, errorResponse };
