'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    const hash = (pw) => bcrypt.hashSync(pw, 10);

    const users = [
      { name: 'Admin', email: 'admin@bloodlink.test', phone: '+27000000001', role: 'admin', password: 'admin1234' },
      { name: 'City Hospital', email: 'hospital@bloodlink.test', phone: '+27000000002', role: 'hospital', password: 'hospital1234' },
      { name: 'Thabo Dlamini', email: 'donor@bloodlink.test', phone: '+27000000003', role: 'donor', password: 'donor1234' },
      { name: 'Nomsa Khumalo', email: 'recipient@bloodlink.test', phone: '+27000000004', role: 'recipient', password: 'recipient1234' },
    ];

    await queryInterface.bulkInsert(
      'users',
      users.map((u) => ({
        name: u.name,
        email: u.email,
        phone: u.phone,
        password_hash: hash(u.password),
        role: u.role,
        is_active: true,
        verification_status: 'approved',
        created_at: now,
        updated_at: now,
      }))
    );

    const [[donor]] = await queryInterface.sequelize.query("SELECT id FROM users WHERE email = 'donor@bloodlink.test'");
    const [[hospital]] = await queryInterface.sequelize.query("SELECT id FROM users WHERE email = 'hospital@bloodlink.test'");
    const [[recipient]] = await queryInterface.sequelize.query("SELECT id FROM users WHERE email = 'recipient@bloodlink.test'");

    await queryInterface.bulkInsert('donor_profiles', [
      {
        user_id: donor.id,
        blood_group: 'O-',
        is_available: true,
        total_donations: 3,
        latitude: -26.2041,
        longitude: 28.0473,
        address: 'Johannesburg CBD',
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('recipient_profiles', [
      {
        user_id: recipient.id,
        blood_group: 'O-',
        latitude: -26.2041,
        longitude: 28.0473,
        address: 'Johannesburg CBD',
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('hospitals', [
      {
        user_id: hospital.id,
        name: 'City Hospital',
        registration_number: 'REG-0001',
        address: '1 Main Street',
        latitude: -26.2041,
        longitude: 28.0473,
        contact_phone: '+27000000002',
        is_verified: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('app_settings', [
      { key: 'matching_radius_km', value: '50', description: 'Default donor search radius in kilometres' },
      { key: 'request_expiry_hours', value: '24', description: 'Default request lifetime in hours' },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('app_settings', null, {});
    await queryInterface.bulkDelete('hospitals', null, {});
    await queryInterface.bulkDelete('recipient_profiles', null, {});
    await queryInterface.bulkDelete('donor_profiles', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
