// tests/health.test.js
const request = require('supertest');
const app = require('../app');

describe('Health Check API', () => {
  it('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'OK');
  });
});
