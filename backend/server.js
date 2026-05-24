const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const { ClinicBranding } = require('./models'); // Required for sync/auth if needed

// Import Routes
const patientRoutes = require('./routes/patientRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const brandingRoutes = require('./routes/brandingRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const aiRoutes = require('./routes/aiRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const billingRoutes = require('./routes/billingRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Follow-up Reminder Service
const { startFollowUpReminder, sendFollowUpReminders } = require('./services/followUpReminderService');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes Middleware
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/appointments', appointmentRoutes);

// Manual trigger for follow-up reminders (testing / on-demand)
app.post('/api/reminders/trigger-followup', async (req, res) => {
  try {
    const result = await sendFollowUpReminders();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Database Connection & Sync
sequelize.authenticate()
  .then(() => {
    console.log('MySQL Connected...');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database synchronized...');
    // Start the daily follow-up WhatsApp reminder cron job
    startFollowUpReminder();
  })
  .catch(err => console.log('Error: ' + err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Trigger nodemon restart
