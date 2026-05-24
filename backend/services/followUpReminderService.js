const cron = require('node-cron');
const { Op } = require('sequelize');
const { Prescription, Patient } = require('../models');
const { sendMessage, getStatus } = require('./whatsappService');

/**
 * Formats tomorrow's date as YYYY-MM-DD (IST-safe)
 */
const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Formats a YYYY-MM-DD string to a human-readable form like "25 May 2026"
 */
const formatDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
};

/**
 * Builds the WhatsApp reminder message for a patient
 */
const buildMessage = (patientName, clinicName, followUpDate, doctorName) => {
  const dateFormatted = formatDate(followUpDate);
  return (
    `🏥 *${clinicName || 'SevaFlow Clinic'}*\n\n` +
    `Namaste *${patientName}* ji! 🙏\n\n` +
    `Aapka *follow-up appointment kal* scheduled hai:\n` +
    `📅 Date: *${dateFormatted}*\n` +
    `👨‍⚕️ Doctor: *${doctorName || 'Dr. Sharma'}*\n\n` +
    `Please samay par clinic pahunche. Koi sawaal ho to humse sampark karein.\n\n` +
    `_Aapki sehat hamari zimmedaari hai._ ❤️`
  );
};

/**
 * Sends follow-up reminders for all patients whose follow-up is tomorrow.
 * Called by the cron job, but also exported so it can be triggered manually.
 */
const sendFollowUpReminders = async () => {
  const tomorrowDate = getTomorrowDate();
  console.log(`\n📅 [FollowUp Reminder] Checking follow-ups for: ${tomorrowDate}`);

  // Check if WhatsApp is connected
  const status = getStatus();
  if (!status.isReady) {
    console.warn('⚠️  [FollowUp Reminder] WhatsApp not ready — skipping reminders for today.');
    return { skipped: true, reason: 'WhatsApp not connected' };
  }

  try {
    // Find all prescriptions with follow-up date = tomorrow that have a linked patient
    const prescriptions = await Prescription.findAll({
      where: { followUp: tomorrowDate },
      include: [{
        model: Patient,
        as: 'patient',
        attributes: ['name', 'phone'],
        required: true   // Only include rows where patient exists
      }]
    });

    if (prescriptions.length === 0) {
      console.log('✅ [FollowUp Reminder] No follow-ups scheduled for tomorrow.');
      return { sent: 0, failed: 0, total: 0 };
    }

    console.log(`📋 [FollowUp Reminder] Found ${prescriptions.length} follow-up(s). Sending reminders...`);

    let sent = 0;
    let failed = 0;
    const results = [];

    for (const prescription of prescriptions) {
      const patient = prescription.patient;

      // Skip patients with no phone number
      if (!patient?.phone) {
        console.warn(`⚠️  [FollowUp Reminder] No phone for patient: ${patient?.name || 'Unknown'} — skipped.`);
        results.push({ name: patient?.name, status: 'skipped', reason: 'No phone number' });
        continue;
      }

      const message = buildMessage(
        patient.name,
        process.env.CLINIC_NAME || 'SevaFlow Clinic',
        tomorrowDate,
        process.env.DOCTOR_NAME || 'Dr. Sharma'
      );

      try {
        await sendMessage(patient.phone, message);
        console.log(`✅ [FollowUp Reminder] Message sent → ${patient.name} (${patient.phone})`);
        results.push({ name: patient.name, phone: patient.phone, status: 'sent' });
        sent++;

        // Small delay between messages to avoid WhatsApp rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (msgErr) {
        console.error(`❌ [FollowUp Reminder] Failed → ${patient.name}: ${msgErr.message}`);
        results.push({ name: patient.name, phone: patient.phone, status: 'failed', error: msgErr.message });
        failed++;
      }
    }

    console.log(`\n📊 [FollowUp Reminder] Summary: ${sent} sent, ${failed} failed out of ${prescriptions.length} total.\n`);
    return { sent, failed, total: prescriptions.length, results };

  } catch (err) {
    console.error('❌ [FollowUp Reminder] Fatal error:', err.message);
    return { error: err.message };
  }
};

/**
 * Start the cron job.
 * Runs every day at 9:00 AM (IST = UTC+5:30, so cron runs at 3:30 UTC).
 * Cron format: minute hour day month weekday
 */
const startFollowUpReminder = () => {
  // Run every day at 9:00 AM IST
  cron.schedule('0 9 * * *', async () => {
    console.log('\n🔔 [Cron] Follow-up reminder job triggered at 9:00 AM');
    await sendFollowUpReminders();
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('🕘 [FollowUp Reminder] Cron job scheduled → runs daily at 9:00 AM IST');
};

module.exports = { startFollowUpReminder, sendFollowUpReminders };
