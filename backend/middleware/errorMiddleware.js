// 1. Add the missing ApiError class here
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 2. Keep your existing errorHandler
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';                                                   

  console.error(`[${req.method}] ${req.path} >>`, err.stack);

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: isProd && statusCode === 500 ? 'Internal server error' : err.message,
    stack: isProd ? undefined : err.stack,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

