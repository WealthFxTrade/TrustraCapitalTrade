// backend/middleware/validate.js
import { validationResult } from 'express-validator';
import { ApiError } from './errorMiddleware.js';

export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    // Pass the first error found to the global handler
    const firstError = errors.array()[0].msg;
    next(new ApiError(400, firstError));
  };
};

