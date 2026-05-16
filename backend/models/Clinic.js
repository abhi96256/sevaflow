const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Clinic = sequelize.define('Clinic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ownerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
  },
  subscriptionPlan: {
    type: DataTypes.STRING,
    defaultValue: 'Basic',
  },
  doctorPassword: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'doctor123',
  },
  staffPassword: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'staff123',
  },
  status: {
    type: DataTypes.ENUM('Active', 'Pending', 'Inactive'),
    defaultValue: 'Pending',
  },
  lastLogin: {
    type: DataTypes.DATE,
  }
});

module.exports = Clinic;
