// middleware/roleMiddleware.js
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied – insufficient permissions',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied – required role: ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
};
