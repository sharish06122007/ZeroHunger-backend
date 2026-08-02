// utils/apiResponse.js

/**
 * Standard success response formatter.
 */
function successResponse(res, data = {}, message = 'Operation successful', status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data: data || {},
    errors: [],
  });
}

/**
 * Standard error response formatter.
 * Flexible signature support: (res, message, errors, status) or (res, errors, message, status)
 */
function errorResponse(res, message = 'Operation failed', errors = [], status = 400) {
  let msg = 'Operation failed';
  let errArray = [];
  let code = 400;

  if (typeof message === 'string') {
    msg = message;
    errArray = Array.isArray(errors) ? errors : (errors ? [errors] : []);
    code = typeof status === 'number' ? status : 400;
  } else if (Array.isArray(message)) {
    errArray = message;
    msg = typeof errors === 'string' ? errors : 'Validation failed';
    code = typeof status === 'number' ? status : (typeof errors === 'number' ? errors : 400);
  } else {
    msg = String(message || 'Operation failed');
  }

  return res.status(code).json({
    success: false,
    message: msg,
    errors: errArray,
  });
}

module.exports = {
  successResponse,
  errorResponse,
  success: successResponse,
  error: errorResponse,
};
