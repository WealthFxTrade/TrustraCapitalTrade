import { ApiError } from './errorMiddleware.js';

/**
 * @middleware adminOnly
 * @description Intercepts requests to ensure the authenticated user has Zurich HQ clearance.
 */
export const adminOnly = (req, res, next) => {
  // We assume req.user is populated by the preceding 'protect' middleware
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    // 403 Forbidden: The server understands the request but refuses to authorize it.
    next(new ApiError(403, "Access Denied: Administrative Clearance Required. Protocol 403."));
  }
};
