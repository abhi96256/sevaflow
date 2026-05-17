const Patient = require('./Patient');
const Prescription = require('./Prescription');
const Medicine = require('./Medicine');
const PatientRecord = require('./PatientRecord');
const ClinicBranding = require('./ClinicBranding');
const Appointment = require('./Appointment');
const Clinic = require('./Clinic');
const Announcement = require('./Announcement');
const Invoice = require('./Invoice');

// Associations
Patient.hasMany(Prescription, { foreignKey: 'patientId' });
Prescription.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Prescription.hasMany(Medicine, { as: 'medicines', foreignKey: 'prescriptionId' });
Medicine.belongsTo(Prescription, { foreignKey: 'prescriptionId' });

Patient.hasMany(PatientRecord, { foreignKey: 'patientId', as: 'records' });
PatientRecord.belongsTo(Patient, { foreignKey: 'patientId' });

Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

// Multi-tenancy Associations
Clinic.hasMany(Patient, { foreignKey: 'clinicId' });
Patient.belongsTo(Clinic, { foreignKey: 'clinicId' });

Clinic.hasMany(Prescription, { foreignKey: 'clinicId' });
Prescription.belongsTo(Clinic, { foreignKey: 'clinicId' });

Clinic.hasMany(Appointment, { foreignKey: 'clinicId' });
Appointment.belongsTo(Clinic, { foreignKey: 'clinicId' });

Clinic.hasMany(Invoice, { foreignKey: 'clinicId' });
Invoice.belongsTo(Clinic, { foreignKey: 'clinicId' });

const sequelize = require('../config/db');

module.exports = {
  Patient,
  Prescription,
  Medicine,
  PatientRecord,
  ClinicBranding,
  Appointment,
  Clinic,
  Announcement,
  Invoice,
  sequelize
};

