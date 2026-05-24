const { Appointment, Patient, sequelize } = require('../models');

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, appointmentDate, appointmentTime, reason, status } = req.body;
    
    // Check if patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const newAppointment = await Appointment.create({
      patientId,
      appointmentDate,
      appointmentTime,
      reason,
      status: status || 'Scheduled'
    });

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Failed to create appointment', error: error.message });
  }
};

// Get all appointments with patient details
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [{ model: Patient, as: 'patient', attributes: ['name', 'phone', 'gender', 'age'] }],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

// Get today's appointments (Queue / OPD Tracker)
exports.getTodayAppointments = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await Appointment.findAll({
      where: { appointmentDate: today },
      include: [{ model: Patient, as: 'patient', attributes: ['name', 'phone', 'gender', 'age'] }],
      order: [['appointmentTime', 'ASC']]
    });
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    res.status(500).json({ message: "Failed to fetch today's appointments" });
  }
};

// Update an appointment status or details
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, appointmentDate, appointmentTime, reason } = req.body;
    
    await Appointment.update(
      { status, appointmentDate, appointmentTime, reason },
      { where: { id } }
    );
    
    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Failed to update appointment' });
  }
};

// Delete an appointment
exports.deleteAppointment = async (req, res) => {
  try {
    await Appointment.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Failed to delete appointment' });
  }
};
