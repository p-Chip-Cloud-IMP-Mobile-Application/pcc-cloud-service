// utils/responseHelper.js
const createResponse = (
  res,
  statusCode,
  message,
  data = null,
  error = null
) => {
  const response = {
    status: statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    response.error = {
      code: error.code || null, // Optional error code
      description: error.description || null, // Optional error description
      message: error.message || "An error occurred", // Fallback to a generic message if none provided
    };
  }

  return res.status(statusCode).json(response);
};

module.exports = createResponse;
