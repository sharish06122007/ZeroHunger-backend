// middleware/role.js
/**
 * Role‑based access control middleware.
 * Usage: app.use('/api/admin', role('admin'), adminRouter);
 */
function role(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return require('../utils/apiResponse').error(res, 'Unauthorized', [], 401);
    }
    const userRole = req.user.role;
    if (userRole !== requiredRole) {
      return require('../utils/apiResponse').error(res, 'Forbidden – insufficient permissions', [], 403);
    }
    next();
  };
}

module.exports = role;
