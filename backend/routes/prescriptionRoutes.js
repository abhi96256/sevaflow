const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

router.get('/followups', prescriptionController.getTodayFollowups);
router.post('/', prescriptionController.createPrescription);
router.get('/', prescriptionController.getPrescriptions);
router.put('/:id', prescriptionController.updatePrescription);
router.delete('/:id', prescriptionController.deletePrescription);

module.exports = router;
