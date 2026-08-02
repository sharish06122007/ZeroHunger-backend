const normalizeRequestStatus = (status) => {
  if (status === 'accepted') return 'approved';
  return status;
};

module.exports = { normalizeRequestStatus };
