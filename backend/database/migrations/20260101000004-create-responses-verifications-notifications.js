'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('donor_responses', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      request_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'blood_requests', key: 'id' }, onDelete: 'CASCADE' },
      donor_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'donor_profiles', key: 'id' }, onDelete: 'CASCADE' },
      response: { type: Sequelize.ENUM('pending', 'accepted', 'declined'), allowNull: false, defaultValue: 'pending' },
      distance_km: { type: Sequelize.DECIMAL(6, 2), allowNull: true },
      responded_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('donor_responses', ['request_id', 'donor_id'], {
      unique: true,
      name: 'responses_request_donor_unique',
    });
    await queryInterface.addIndex('donor_responses', ['donor_id'], { name: 'responses_donor' });

    await queryInterface.createTable('verifications', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      donor_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'donor_profiles', key: 'id' }, onSetNull: true },
      hospital_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'hospitals', key: 'id' }, onDelete: 'CASCADE' },
      donation_id: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), allowNull: false, defaultValue: 'pending' },
      verified_at: { type: Sequelize.DATE, allowNull: true },
      remarks: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('verifications', ['donor_id'], { name: 'verifications_donor' });
    await queryInterface.addIndex('verifications', ['status'], { name: 'verifications_status' });

    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING(160), allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      data: { type: Sequelize.JSON, allowNull: true },
      is_read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('notifications', ['user_id', 'is_read'], { name: 'notifications_user_read' });

    await queryInterface.createTable('app_settings', {
      key: { type: Sequelize.STRING(80), primaryKey: true, allowNull: false },
      value: { type: Sequelize.TEXT, allowNull: false },
      description: { type: Sequelize.STRING(255), allowNull: true },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('app_settings');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('verifications');
    await queryInterface.dropTable('donor_responses');
  },
};
