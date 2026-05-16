const express = require('express');
const router = express.Router();
const brandingController = require('../controllers/brandingController');

router.get('/', brandingController.getBranding);
router.post('/', brandingController.updateBranding);

module.exports = router;
