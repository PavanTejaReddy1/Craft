/**
 * Global error handler middleware.
 * Catches all errors thrown/forwarded in the app.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(statusCode).json({ success: false, message: 'Validation failed', errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    message = `${field ? `${field} already exists` : 'Duplicate entry'}`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = `File too large. Max ${process.env.MAX_FILE_SIZE_MB || 10}MB allowed`;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', err);
    return res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
    });
  }

  return res.status(statusCode).json({ success: false, message });
};

export default errorHandler;
