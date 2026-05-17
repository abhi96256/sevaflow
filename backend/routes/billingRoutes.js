const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.post('/', billingController.createInvoice);
router.get('/', billingController.getInvoices);
router.get('/stats', billingController.getInvoiceStats);
router.get('/:id', billingController.getInvoiceById);

module.exports = router;

