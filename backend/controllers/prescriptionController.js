const { Prescription, Medicine, sequelize } = require('../models');

exports.createPrescription = async (req, res) => {
  const { patientId, patientName, diagnosis, medicines, vitals, labTests, followUp } = req.body;
  try {
    const result = await sequelize.transaction(async (t) => {
      const prescription = await Prescription.create({
        patientId,
        patientName,
        diagnosis,
        bp: vitals?.bp || null,
        pr: vitals?.pr || null,
        temp: vitals?.temp || null,
        spo2: vitals?.spo2 || null,
        labTests: labTests || [],
        followUp: followUp || null
      }, { transaction: t });

      if (medicines && medicines.length > 0) {
        const medsToInsert = medicines.map(({ id, ...rest }) => ({
          prescriptionId: prescription.id,
          ...rest
        }));
        await Medicine.bulkCreate(medsToInsert, { transaction: t });
      }
      return prescription;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Create Prescription Error:', error);
    res.status(500).json({ message: 'Error saving prescription', error: error.message });
  }
};

exports.getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      include: [{ model: Medicine, as: 'medicines' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescriptions' });
  }
};

exports.updatePrescription = async (req, res) => {
  const { id } = req.params;
  const { patientId, patientName, diagnosis, medicines, vitals, labTests, followUp } = req.body;
  try {
    await sequelize.transaction(async (t) => {
      await Prescription.update({ 
        patientId, 
        patientName, 
        diagnosis,
        bp: vitals?.bp || null,
        pr: vitals?.pr || null,
        temp: vitals?.temp || null,
        spo2: vitals?.spo2 || null,
        labTests: labTests || [],
        followUp: followUp || null
      }, { where: { id }, transaction: t });
      await Medicine.destroy({ where: { prescriptionId: id }, transaction: t });
      if (medicines && medicines.length > 0) {
        const medsToInsert = medicines.map(({ id: mid, ...rest }) => ({
          prescriptionId: id,
          ...rest
        }));
        await Medicine.bulkCreate(medsToInsert, { transaction: t });
      }
    });
    res.json({ message: 'Prescription updated successfully' });
  } catch (error) {
    console.error('Update Prescription Error:', error);
    res.status(500).json({ message: 'Error updating prescription', error: error.message });
  }
};

exports.deletePrescription = async (req, res) => {
  try {
    await Prescription.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting prescription' });
  }
};

exports.getTodayFollowups = async (req, res) => {
  try {
    const { Patient } = require('../models');
    const today = new Date().toISOString().split('T')[0];
    
    const followups = await Prescription.findAll({
      where: { followUp: today },
      include: [{ 
        model: Patient, 
        as: 'patient',
        attributes: ['name', 'phone']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(followups);
  } catch (error) {
    console.error('Fetch Followups Error:', error);
    res.status(500).json({ message: 'Error fetching follow-ups' });
  }
};
