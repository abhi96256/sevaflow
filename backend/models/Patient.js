const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Patient = sequelize.define('Patient', {
  name: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER },
  gender: { type: DataTypes.ENUM('Male', 'Female', 'Other') },
  phone: { type: DataTypes.STRING },
  history: { type: DataTypes.TEXT }
}, {
  tableName: 'patients',
  timestamps: true
});

module.exports = Patient;
