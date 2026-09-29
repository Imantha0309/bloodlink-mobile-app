const request = require('supertest');
const createApp = require('../src/app');

describe('health & routing', () => {
  const app = createApp();

  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });

  test('unknown route returns 404 with json body', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('protected route without token returns 401', async () => {
    const res = await request(app).get('/api/recipient/requests');
    expect(res.status).toBe(401);
  });
});

describe('validation', () => {
  const app = createApp();

  test('register rejects short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test',
      email: 'test@example.com',
      phone: '000',
      password: 'short',
      role: 'donor',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.password).toBeDefined();
  });

  test('register rejects invalid blood group', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test',
      email: 'test2@example.com',
      phone: '000',
      password: 'longenough',
      role: 'donor',
      bloodGroup: 'Z+',
    });
    expect(res.status).toBe(400);
  });
});
