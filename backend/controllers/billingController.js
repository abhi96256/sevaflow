const { Invoice } = require('../models');
const { Op } = require('sequelize');

// Create a new invoice
exports.createInvoice = async (req, res) => {
  try {
    const { patientName, patientPhone, items, subtotal, gst, grandTotal, clinicId } = req.body;
    
    if (!patientName || !patientPhone || !items) {
      return res.status(400).json({ error: 'Patient name, phone, and bill items are required.' });
    }

    const invoice = await Invoice.create({
      patientName,
      patientPhone,
      items,
      subtotal: parseFloat(subtotal) || 0,
      gst: parseFloat(gst) || 0,
      grandTotal: parseFloat(grandTotal) || 0,
      clinicId: clinicId || null
    });

    res.status(201).json({ message: 'Invoice saved successfully!', invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all invoices
exports.getInvoices = async (req, res) => {
  try {
    const { clinicId } = req.query;
    const whereClause = clinicId ? { clinicId } : {};
    
    const invoices = await Invoice.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get today's stats/reports
exports.getInvoiceStats = async (req, res) => {
  try {
    const { clinicId } = req.query;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const whereClause = {
      createdAt: {
        [Op.between]: [todayStart, todayEnd]
      }
    };

    if (clinicId) {
      whereClause.clinicId = clinicId;
    }

    const todayInvoices = await Invoice.findAll({ where: whereClause });

    const totalRevenue = todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const invoiceCount = todayInvoices.length;

    res.status(200).json({
      revenue: totalRevenue,
      count: invoiceCount,
      invoices: todayInvoices
    });
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get a single invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

