const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');
const { Invoice } = require('../models');
const { MessageMedia } = require('whatsapp-web.js');

// GET /api/whatsapp/status — check if WhatsApp is connected + get QR code
router.get('/status', (req, res) => {
  const status = whatsappService.getStatus();
  res.json(status);
});

// POST /api/whatsapp/send-invoice — send invoice via WhatsApp automatically
router.post('/send-invoice', async (req, res) => {
  try {
    const { patientName, patientPhone, items, subtotal, gst, grandTotal, pdfBase64 } = req.body;

    if (!patientPhone) {
      return res.status(400).json({ error: 'Patient phone number is required.' });
    }

    // Build invoice message
    const invoiceId = `SF-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    let itemsListText = '';
    items.forEach(item => {
      itemsListText += `• *${item.desc}* — ₹${item.price.toFixed(2)}\n`;
    });

    const message =
      `*🏥 SevaFlow Clinical Network*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Invoice ID:* ${invoiceId}\n` +
      `*Date:* ${today}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Patient:* ${patientName}\n` +
      `*Phone:* +91 ${patientPhone}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*📋 Billed Items:*\n${itemsListText}` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Subtotal: ₹${subtotal.toFixed(2)}\n` +
      `GST (18%): ₹${gst.toFixed(2)}\n` +
      `*💰 Grand Total: ₹${grandTotal.toFixed(2)}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `✨ Thank you for choosing SevaFlow! Get well soon! 🌿`;

    // Send via WhatsApp (send real PDF if base64 provided)
    if (pdfBase64) {
      const fileName = `Invoice_${patientName.replace(/\s+/g, '_')}_${invoiceId}.pdf`;
      const media = new MessageMedia('application/pdf', pdfBase64, fileName);
      await whatsappService.sendMedia(patientPhone, media, message);
    } else {
      await whatsappService.sendMessage(patientPhone, message);
    }

    // Save to DB
    await Invoice.create({
      patientName,
      patientPhone,
      items,
      subtotal,
      gst,
      grandTotal,
      clinicId: null
    });

    res.json({ success: true, invoiceId, message: 'WhatsApp message sent successfully!' });
  } catch (error) {
    console.error('WhatsApp send error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
