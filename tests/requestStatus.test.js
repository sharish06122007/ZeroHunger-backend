const { normalizeRequestStatus } = require('../src/utils/requestStatus');

describe('normalizeRequestStatus', () => {
  it('maps approved to approved for frontend compatibility', () => {
    expect(normalizeRequestStatus('approved')).toBe('approved');
  });

  it('maps accepted to approved for frontend compatibility', () => {
    expect(normalizeRequestStatus('accepted')).toBe('approved');
  });

  it('keeps other statuses intact', () => {
    expect(normalizeRequestStatus('rejected')).toBe('rejected');
    expect(normalizeRequestStatus('completed')).toBe('completed');
  });
});
