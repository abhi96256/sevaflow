const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Invoice = sequelize.define('Invoice', {
  patientName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  patientPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  gst: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  grandTotal: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  clinicId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'invoices',
  timestamps: true
});

module.exports = Invoice;
