const { Patient, PatientRecord, Appointment } = require('../models');
const { Op } = require('sequelize');

exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    
    // Automatically create an appointment for today
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    await Appointment.create({
      patientId: patient.id,
      appointmentDate: now.toISOString().split('T')[0],
      appointmentTime: timeString,
      status: 'Waiting',
      reason: req.body.history || 'First Consultation'
    });

    res.status(201).json(patient);
  } catch (err) {
    console.error('Error creating patient:', err);
    res.status(500).json({ message: 'Error creating patient' });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll({ order: [['name', 'ASC']] });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
};

exports.searchPatients = async (req, res) => {
  const { query } = req.query;
  try {
    const patients = await Patient.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { phone: { [Op.like]: `%${query}%` } }
        ]
      },
      include: [
        { 
          model: Appointment, 
          as: 'appointments',
          attributes: ['appointmentDate', 'appointmentTime', 'status'],
          limit: 1,
          order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
        }
      ],
      limit: 10
    });
    res.json(patients);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Error searching patients' });
  }
};

exports.addRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const recordData = { ...req.body, patientId: id };
    const record = await PatientRecord.create(recordData);
    res.status(201).json(record);
  } catch (err) {
    console.error('Error in addRecord:', err);
    res.status(500).json({ message: 'Error adding patient record', error: err.message, stack: err.stack });
  }
};

exports.getRecords = async (req, res) => {
  try {
    const { id } = req.params;
    const records = await PatientRecord.findAll({
      where: { patientId: id },
      order: [['recordDate', 'DESC']]
    });
    res.json(records);
  } catch (err) {
    console.error('Error in getRecords:', err);
    res.status(500).json({ message: 'Error fetching patient records', error: err.message, stack: err.stack });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const appointments = await Appointment.findAll({
      where: { appointmentDate: targetDate },
      include: [{ model: Patient, as: 'patient' }],
      order: [['appointmentTime', 'ASC']]
    });
    
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await Appointment.update({ status }, { where: { id } });
    
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ message: 'Error updating appointment status' });
  }
};

exports.getPatientFullHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { PatientRecord, Prescription, Medicine } = require('../models');
    
    const patient = await Patient.findByPk(id, {
      include: [
        { model: PatientRecord, as: 'records' },
        { 
          model: Prescription, 
          include: [{ model: Medicine, as: 'medicines' }] 
        }
      ]
    });
    
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    res.json(patient);
  } catch (err) {
    console.error('Error fetching full history:', err);
    res.status(500).json({ message: 'Error fetching patient history' });
  }
};
