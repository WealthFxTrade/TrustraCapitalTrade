// backend/middleware/errorMiddleware.js

/**
 * Custom Operational Error Class
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;           // Mark as expected error
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @desc    404 Not Found Handler
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
  next(error);
};

/**
 * @desc    Global Error Handler Middleware
 *          Catches all errors and sends safe responses to client
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;

  // Log full error details for debugging (visible in Render logs)
  console.error('🚨 SYSTEM ERROR:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    stack: err.stack,
    body: process.env.NODE_ENV === 'development' ? req.body : undefined,
  });

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // JWT errors (already handled in middleware, but safety net)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please log in again.';
  }

  // Final safe response
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? (statusCode === 500 
          ? 'An unexpected error occurred. Our team has been notified.' 
          : message)
      : message,
    // Only expose stack trace in development
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      errorType: err.name 
    }),
  });
};
