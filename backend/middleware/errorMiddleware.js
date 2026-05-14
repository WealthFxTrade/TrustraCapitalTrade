// backend/middleware/errorMiddleware.js

/**
 * Custom operational API error class structure
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @desc    Catch-all middleware for missing resource endpoints
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

/**
 * @desc    Global application error pipeline filter
 *          Ensures low-level engineering diagnostics do not leak to public clients
 */
export const errorHandler = (err, req, res, next) => {
  // Always log full engineering traces locally on your Render terminal log view
  console.error('SYSTEM EXCEPTION TRACKER:', {
    timestamp: new Date().toISOString(),
    message: err.message,
    stack: err.stack
  });

  const statusCode = err.statusCode || 500;
  
  // PRODUCTION PROTECTION: Mask system execution strings completely from live users
  const fallbackMessage = statusCode === 500 
    ? 'An unexpected error occurred within our institutional platform. Please try again later.' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? fallbackMessage : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

