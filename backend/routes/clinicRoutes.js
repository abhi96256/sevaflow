const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');

router.get('/', clinicController.getAllClinics);
router.post('/', clinicController.createClinic);
router.get('/stats', clinicController.getGlobalStats);

module.exports = router;
