const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PatientRecord = sequelize.define('PatientRecord', {
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  recordType: { type: DataTypes.ENUM('Test', 'Diagnosis', 'Event', 'Checkup'), defaultValue: 'Test' },
  title: { type: DataTypes.STRING, allowNull: false }, // e.g. 'Lab Test', 'First Consultation', 'Abdominal'
  description: { type: DataTypes.TEXT }, // e.g. 'Gastritis', 'High Sugar'
  severityOrStatus: { type: DataTypes.STRING }, // e.g. 'High', 'Medium', 'Completed', 'Pending'
  zoneId: { type: DataTypes.STRING }, // e.g. 'head', 'chest', 'stomach'
  recordDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
}, {
  tableName: 'patient_records',
  timestamps: true
});

module.exports = PatientRecord;
