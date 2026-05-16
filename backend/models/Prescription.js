const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Prescription = sequelize.define('Prescription', {
  patientId: { type: DataTypes.INTEGER },
  patientName: { type: DataTypes.STRING, allowNull: false },
  diagnosis: { type: DataTypes.TEXT },
  bp: { type: DataTypes.STRING },
  pr: { type: DataTypes.STRING },
  temp: { type: DataTypes.STRING },
  spo2: { type: DataTypes.STRING },
  labTests: { type: DataTypes.JSON },
  followUp: { type: DataTypes.DATEONLY }
}, {
  tableName: 'prescriptions',
  updatedAt: false
});

module.exports = Prescription;
