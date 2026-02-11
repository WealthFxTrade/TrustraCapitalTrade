/**
 * @desc    Custom Error Class for API responses
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @desc    404 Not Found Middleware
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

/**
 * @desc    Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  // If headers were already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // Log errors for the developer (Render/Vercel logs)
  console.error(`❌ [${req.method}] ${req.path} Error:`, err.message);
  if (!isProd) console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: isProd && statusCode === 500 ? 'An internal server error occurred' : err.message,
    // Hide stack trace in production for security
    stack: isProd ? undefined : err.stack,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

