'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('blood_requests', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      recipient_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      hospital_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'hospitals', key: 'id' }, onSetNull: true },
      blood_group: { type: Sequelize.STRING(3), allowNull: false },
      units_required: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      urgency: {
        type: Sequelize.ENUM('critical', 'high', 'medium', 'low'),
        allowNull: false,
        defaultValue: 'medium',
      },
      status: {
        type: Sequelize.ENUM('pending', 'matching', 'fulfilled', 'cancelled', 'expired'),
        allowNull: false,
        defaultValue: 'pending',
      },
      patient_name: { type: Sequelize.STRING(120), allowNull: true },
      patient_age: { type: Sequelize.INTEGER, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      latitude: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      longitude: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      expires_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('blood_requests', ['blood_group', 'status'], { name: 'requests_blood_status' });
    await queryInterface.addIndex('blood_requests', ['recipient_id'], { name: 'requests_recipient' });
    await queryInterface.addIndex('blood_requests', ['urgency'], { name: 'requests_urgency' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('blood_requests');
  },
};
