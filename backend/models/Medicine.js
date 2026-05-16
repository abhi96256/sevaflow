const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Medicine = sequelize.define('Medicine', {
  prescriptionId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  dosage: { type: DataTypes.STRING },
  timing: { type: DataTypes.STRING },
  duration: { type: DataTypes.STRING }
}, {
  tableName: 'prescription_medicines',
  timestamps: true
});

module.exports = Medicine;
