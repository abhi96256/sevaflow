const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getAllInventory);
router.post('/refill/:id', inventoryController.refillStock);
router.post('/add', inventoryController.addMedicine);

module.exports = router;
