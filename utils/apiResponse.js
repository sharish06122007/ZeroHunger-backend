// utils/apiResponse.js

/**
 * Standard success response formatter.
 * @param {object} res Express response object
 * @param {any} data Payload to send (object, array, etc.)
 * @param {string} [message='Operation successful']
 * @param {number} [status=200]
 */
function successResponse(res, data = null, message = 'Operation successful', status = 200) {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
}

/**
 * Standard error response formatter.
 * @param {object} res Express response object
 * @param {Array|string} errors Error details (array of messages or single message)
 * @param {string} [message='Operation failed']
 * @param {number} [status=400]
 */
function errorResponse(res, errors = [], message = 'Operation failed', status = 400) {
  const errArray = Array.isArray(errors) ? errors : [errors];
  return res.status(status).json({
    success: false,
    errors: errArray,
    message,
  });
}

module.exports = {
  successResponse,
  errorResponse,
  success: successResponse,
  error: errorResponse,
};
