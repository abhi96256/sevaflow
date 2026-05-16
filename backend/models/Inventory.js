const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Inventory = sequelize.define('Inventory', {
    name: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    unit: { type: DataTypes.STRING },
    runway: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    lastOrdered: { type: DataTypes.DATEONLY }
}, {
    tableName: 'inventory'
});

module.exports = Inventory;
