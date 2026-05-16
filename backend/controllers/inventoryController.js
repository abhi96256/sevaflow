const Inventory = require('../models/Inventory');

exports.getAllInventory = async (req, res) => {
    try {
        const items = await Inventory.findAll();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.refillStock = async (req, res) => {
    try {
        const item = await Inventory.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        // Logic: Refill adds 50 units (example strip count)
        const newStock = item.stock + 50;
        await item.update({
            stock: newStock,
            status: newStock > 50 ? 'Healthy' : 'Low',
            lastOrdered: new Date()
        });
        
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addMedicine = async (req, res) => {
    try {
        const newItem = await Inventory.create(req.body);
        res.json(newItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
