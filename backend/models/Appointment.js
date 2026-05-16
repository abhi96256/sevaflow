const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Appointment = sequelize.define('Appointment', {
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  appointmentDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  appointmentTime: { type: DataTypes.STRING }, // e.g. '10:30 AM'
  status: { 
    type: DataTypes.ENUM('Waiting', 'In Consultation', 'Done', 'Scheduled'), 
    defaultValue: 'Waiting' 
  },
  reason: { type: DataTypes.STRING }, // Chief Complaint
}, {
  tableName: 'appointments',
  timestamps: true
});

module.exports = Appointment;
