// errorHandler.js
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred";
  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
