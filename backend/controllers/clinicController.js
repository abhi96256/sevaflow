const { Clinic, Patient, Prescription } = require('../models');

exports.getAllClinics = async (req, res) => {
  try {
    const clinics = await Clinic.findAll();
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createClinic = async (req, res) => {
  try {
    const clinic = await Clinic.create(req.body);
    res.status(201).json(clinic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getGlobalStats = async (req, res) => {
  try {
    const clinics = await Clinic.findAll();
    const patientCount = await Patient.count();
    const prescriptionCount = await Prescription.count();
    
    let totalRevenue = 0;
    clinics.forEach(c => {
      const plan = c.subscriptionPlan || 'Basic';
      if (plan === 'Enterprise') totalRevenue += 9999;
      else if (plan === 'Pro') totalRevenue += 4999;
      else totalRevenue += 1999;
    });

    res.json({
      totalClinics: clinics.length,
      totalPatients: patientCount,
      totalPrescriptions: prescriptionCount,
      revenueEstimate: totalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
