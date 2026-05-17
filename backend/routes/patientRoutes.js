const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.post('/', patientController.createPatient);
router.get('/', patientController.getPatients);
router.get('/stats', patientController.getPatientStats);
router.get('/search', patientController.searchPatients);
router.post('/:id/records', patientController.addRecord);
router.get('/:id/records', patientController.getRecords);
router.get('/:id/history', patientController.getPatientFullHistory);
router.get('/appointments', patientController.getAppointments);
router.post('/appointments', patientController.createAppointment);
router.patch('/appointments/:id/status', patientController.updateAppointmentStatus);
router.delete('/appointments/:id', patientController.deleteAppointment);

module.exports = router;
