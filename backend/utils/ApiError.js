// backend/utils/ApiError.js

class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace (only in V8/Chrome-like envs)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
