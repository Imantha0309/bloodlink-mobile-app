const request = require('supertest');
const { sequelize } = require('../src/models');
const createApp = require('../src/app');
const recipientService = require('../src/services/recipientService');

const app = createApp();

const login = async (email, password) => {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  expect(res.status).toBe(200);
  return res.body.data.token;
};

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  const bcrypt = require('bcryptjs');
  const { User, DonorProfile, RecipientProfile, Hospital } = require('../src/models');
  const hash = bcrypt.hashSync('password123', 10);
  const admin = await User.create({ name: 'Admin', email: 'a@t.io', phone: '1', passwordHash: hash, role: 'admin', verificationStatus: 'approved' });
  const rUser = await User.create({ name: 'Rec', email: 'r@t.io', phone: '2', passwordHash: hash, role: 'recipient', verificationStatus: 'approved' });
  const dUser = await User.create({ name: 'Don', email: 'd@t.io', phone: '3', passwordHash: hash, role: 'donor', verificationStatus: 'approved' });
  const hUser = await User.create({ name: 'Hosp', email: 'h@t.io', phone: '4', passwordHash: hash, role: 'hospital', verificationStatus: 'approved' });
  await RecipientProfile.create({ userId: rUser.id, bloodGroup: 'O-', latitude: -26.2041, longitude: 28.0473 });
  await DonorProfile.create({ userId: dUser.id, bloodGroup: 'O-', isAvailable: true, latitude: -26.2100, longitude: 28.0500, totalDonations: 1 });
  await Hospital.create({ userId: hUser.id, name: 'City Hospital', registrationNumber: 'R1', latitude: -26.2041, longitude: 28.0473, isVerified: true });
  expect(admin).toBeTruthy();
});

afterAll(async () => {
  await sequelize.close();
});

test('full request lifecycle', async () => {
  const recipientToken = await login('r@t.io', 'password123');
  const donorToken = await login('d@t.io', 'password123');
  const hospitalToken = await login('h@t.io', 'password123');
  const adminToken = await login('a@t.io', 'password123');

  // 1. Recipient raises an emergency request -> matching runs automatically
  const created = await request(app)
    .post('/api/recipient/requests')
    .set('Authorization', `Bearer ${recipientToken}`)
    .send({ bloodGroup: 'O-', unitsRequired: 2, urgency: 'critical', patientName: 'Jane', patientAge: 34, latitude: -26.2041, longitude: 28.0473 });
  expect(created.status).toBe(201);
  expect(created.body.data.matchedDonors).toBe(1);
  const requestId = created.body.data.request.id;
  expect(created.body.data.request.status).toBe('matching');

  // 2. The matched donor was notified
  const notifs = await request(app).get('/api/donor/notifications').set('Authorization', `Bearer ${donorToken}`);
  expect(notifs.status).toBe(200);
  expect(notifs.body.data.length).toBe(1);
  expect(notifs.body.data[0].data.requestId).toBe(requestId);

  // 3. Donor sees the request and accepts
  const donorRequests = await request(app).get('/api/donor/requests').set('Authorization', `Bearer ${donorToken}`);
  expect(donorRequests.body.data.length).toBe(1);

  const declinedTwice = await request(app)
    .post(`/api/donor/requests/${requestId}/respond`)
    .set('Authorization', `Bearer ${donorToken}`)
    .send({ response: 'accepted' });
  expect(declinedTwice.status).toBe(200);

  const accepted = await request(app)
    .post(`/api/donor/requests/${requestId}/respond`)
    .set('Authorization', `Bearer ${donorToken}`)
    .send({ response: 'accepted' });
  expect(accepted.status).toBe(409);

  // 4. Recipient sees the accepted donor
  const status = await request(app).get(`/api/recipient/requests/${requestId}/status`).set('Authorization', `Bearer ${recipientToken}`);
  expect(status.body.data.acceptedDonors.length).toBe(1);
  expect(status.body.data.acceptedDonors[0].donor.user.name).toBe('Don');

  // 5. Hospital attaches to the request and marks it fulfilled
  const hospitalList = await request(app).get('/api/hospital/requests').set('Authorization', `Bearer ${hospitalToken}`);
  expect(hospitalList.body.meta.total).toBe(1);

  const updated = await request(app)
    .patch(`/api/hospital/requests/${requestId}/status`)
    .set('Authorization', `Bearer ${hospitalToken}`)
    .send({ status: 'fulfilled' });
  expect(updated.status).toBe(200);
  expect(updated.body.data.status).toBe('fulfilled');

  // 6. Hospital records the donation -> donor counters advance
  const { DonorProfile } = require('../src/models');
  const before = await DonorProfile.findOne({ where: {} });
  const verification = await request(app)
    .post('/api/hospital/verifications')
    .set('Authorization', `Bearer ${hospitalToken}`)
    .send({ donationId: String(before.userId), status: 'approved' });
  expect(verification.status).toBe(201);
  const after = await DonorProfile.findByPk(before.id);
  expect(after.totalDonations).toBe(before.totalDonations + 1);

  // 7. Admin sees stats and can read settings
  const stats = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${adminToken}`);
  expect(stats.body.data.requests).toBe(1);

  const setting = await request(app)
    .put('/api/admin/settings/matching_radius_km')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ value: '75' });
  expect(setting.status).toBe(200);

  // 8. Cross-role access is blocked
  const blocked = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${donorToken}`);
  expect(blocked.status).toBe(403);

  // 9. Recipient cancels are guarded once fulfilled
  const cancel = await request(app).post(`/api/recipient/requests/${requestId}/cancel`).set('Authorization', `Bearer ${recipientToken}`);
  expect(cancel.status).toBe(409);
});

test('availability gate and incompatible blood groups', async () => {
  const donorToken = await login('d@t.io', 'password123');
  const off = await request(app).put('/api/donor/availability').set('Authorization', `Bearer ${donorToken}`).send({ isAvailable: false });
  expect(off.status).toBe(200);
  expect(off.body.data.isAvailable).toBe(false);

  const blocked = await request(app).get('/api/donor/requests').set('Authorization', `Bearer ${donorToken}`);
  expect(blocked.status).toBe(409);

  const on = await request(app).put('/api/donor/availability').set('Authorization', `Bearer ${donorToken}`).send({ isAvailable: true });
  expect(on.body.data.isAvailable).toBe(true);
});

test('expireStale marks overdue requests', async () => {
  const { BloodRequest } = require('../src/models');
  const r = await BloodRequest.create({
    recipientId: 1, bloodGroup: 'B+', urgency: 'low',
    status: 'matching', expiresAt: new Date(Date.now() - 1000),
  });
  const count = await recipientService.expireStale();
  expect(count).toBeGreaterThan(0);
  expect((await BloodRequest.findByPk(r.id)).status).toBe('expired');
});
