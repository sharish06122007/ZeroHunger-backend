// middleware/role.js
const apiResponse = require('../utils/apiResponse');

const role = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiResponse.error(res, 'Not authenticated', [], 401);
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return apiResponse.error(res, 'Access Denied: Insufficient Permissions', [], 403);
    }
    
    next();
  };
};

module.exports = role;
