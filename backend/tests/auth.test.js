const request = require('supertest');
const { sequelize } = require('../src/models');
const createApp = require('../src/app');

const PASSWORD = 'password123';

const register = (app, overrides = {}) =>
  request(app)
    .post('/api/auth/register')
    .send({
      name: 'Nomsa',
      email: 'nomsa@example.com',
      phone: '+27 82 555 0111',
      password: PASSWORD,
      role: 'donor',
      bloodGroup: 'O+',
      ...overrides,
    });

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

describe('auth: login with email or phone', () => {
  const app = createApp();

  beforeAll(async () => {
    await register(app, { name: 'Nomsa', email: 'nomsa@example.com', phone: '+27 82 555 0111' });
    await register(app, { name: 'Thabo', email: 'thabo@example.com', phone: '0712345678', role: 'recipient' });
  });

  test('login still works with the legacy `email` field', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nomsa@example.com', password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('nomsa@example.com');
  });

  test('login accepts an email in the new `identifier` field', async () => {
    const res = await request(app).post('/api/auth/login').send({ identifier: 'nomsa@example.com', password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe('Nomsa');
  });

  test('login accepts a phone number in `identifier`', async () => {
    const res = await request(app).post('/api/auth/login').send({ identifier: '0712345678', password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe('Thabo');
  });

  test('phone login ignores spacing and formatting', async () => {
    const res = await request(app).post('/api/auth/login').send({ identifier: '+27 82 555 0111', password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe('Nomsa');
  });

  test('email lookup is case-insensitive', async () => {
    const res = await request(app).post('/api/auth/login').send({ identifier: 'NOMSA@EXAMPLE.COM', password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe('Nomsa');
  });

  test('wrong password is rejected with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ identifier: '0712345678', password: 'nope-nope' });
    expect(res.status).toBe(401);
  });

  test('unknown phone is rejected with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ identifier: '0799999999', password: PASSWORD });
    expect(res.status).toBe(401);
  });

  test('missing identifier is a 400 validation error', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: PASSWORD });
    expect(res.status).toBe(400);
    expect(res.body.errors.identifier).toBeDefined();
  });

  test('identifier must be a valid email or phone', async () => {
    const res = await request(app).post('/api/auth/login').send({ identifier: 'not-an-email', password: PASSWORD });
    expect(res.status).toBe(400);
  });
});

describe('auth: register validation', () => {
  const app = createApp();

  test('register persists latitude and longitude on the profile', async () => {
    const created = await register(app, {
      email: 'geo@example.com',
      phone: '0821112222',
      latitude: -33.9249,
      longitude: 18.4241,
    });
    expect(created.status).toBe(201);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'geo@example.com', password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.data.profile.latitude).toBeCloseTo(-33.9249, 4);
    expect(res.body.data.profile.longitude).toBeCloseTo(18.4241, 4);
  });

  test('register rejects an out-of-range latitude', async () => {
    const res = await register(app, { email: 'badgeo@example.com', phone: '0822223333', latitude: 120 });
    expect(res.status).toBe(400);
    expect(res.body.errors.latitude).toBeDefined();
  });

  test('register rejects a malformed phone number', async () => {
    const res = await register(app, { email: 'badphone@example.com', phone: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.errors.phone).toBeDefined();
  });

  test('register rejects a duplicate phone number in a different format', async () => {
    const first = await register(app, { email: 'phoneclash@example.com', phone: '+27 83 444 5555' });
    expect(first.status).toBe(201);

    const second = await request(app).post('/api/auth/register').send({
      name: 'Impostor',
      email: 'other@example.com',
      phone: '+27834445555',
      password: PASSWORD,
      role: 'donor',
    });
    expect(second.status).toBe(409);
    expect(second.body.message).toMatch(/phone/i);
  });
});
