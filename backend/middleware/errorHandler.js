const errorHandler = (err, req, res, next) => {
  console.error(`❌ Error (${req.method} ${req.url}):`, err.stack || err.message);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? [err.stack] : [],
  });
};

module.exports = errorHandler;
