const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ClinicBranding = sequelize.define('ClinicBranding', {
  slug: { type: DataTypes.STRING, unique: true },
  clinicName: { type: DataTypes.STRING },
  logo: { type: DataTypes.TEXT('long') },
  bio: { type: DataTypes.TEXT },
  fee: { type: DataTypes.STRING },
  photos: { type: DataTypes.TEXT('long') },
  mapsLink: { type: DataTypes.TEXT },
  whatsappNumber: { type: DataTypes.STRING },
  socialLink: { type: DataTypes.TEXT }
}, {
  tableName: 'clinic_branding',
  timestamps: true
});

module.exports = ClinicBranding;
