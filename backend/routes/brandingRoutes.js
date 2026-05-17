const express = require('express');
const router = express.Router();
const brandingController = require('../controllers/brandingController');

router.get('/', brandingController.getBranding);
router.post('/', brandingController.updateBranding);
router.get('/public/:slug', brandingController.getPublicProfile);

module.exports = router;
