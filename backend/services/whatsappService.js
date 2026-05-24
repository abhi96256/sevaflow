const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let client = null;
let qrCodeData = null;
let isReady = false;
let isInitializing = false;

const clearLocks = (dir) => {
  try {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        clearLocks(fullPath);
      } else if (file === 'SingletonLock' || file.includes('lock')) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`🧹 Cleared stale Puppeteer lock: ${file}`);
        } catch (e) {
          // file is locked by a running process, safe to ignore
        }
      }
    }
  } catch (err) {
    // suppress lock errors
  }
};

const initWhatsApp = () => {
  if (isInitializing || isReady) return;
  isInitializing = true;

  console.log('🧹 Terminating any orphaned WhatsApp background Chrome processes...');
  try {
    execSync('wmic process where "name=\'chrome.exe\' and CommandLine like \'%wwebjs_auth%\'" call terminate 2>nul');
  } catch (e) {
    // Ignore if command fails or no process found
  }

  console.log('🧹 Cleaning up stale WhatsApp browser lock files...');
  clearLocks(path.join(process.cwd(), '.wwebjs_auth'));

  console.log('🟢 Initializing WhatsApp Client...');



  client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth', rmMaxRetries: 10 }),
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    },
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      ]
    }
  });



  client.on('qr', async (qr) => {
    console.log('📱 WhatsApp QR Code generated — scan from app');
    try {
      qrCodeData = await qrcode.toDataURL(qr);
    } catch (err) {
      console.error('QR error:', err);
    }
    isReady = false;
  });

  client.on('ready', () => {
    console.log('✅ WhatsApp Client is ready!');
    isReady = true;
    qrCodeData = null;
    isInitializing = false;
  });

  client.on('authenticated', () => {
    console.log('🔐 WhatsApp Authenticated!');
  });

  client.on('auth_failure', () => {
    console.log('❌ WhatsApp Auth Failed — restart server to try again');
    isReady = false;
    isInitializing = false;
  });

  client.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp Disconnected:', reason);
    isReady = false;
    isInitializing = false;
    client = null;
    // Auto reconnect after 5 seconds
    setTimeout(initWhatsApp, 5000);
  });

  client.initialize().catch(async (err) => {
    console.error('❌ Failed to initialize WhatsApp client:', err.message);
    isReady = false;
    isInitializing = false;
    if (client) {
      try {
        await client.destroy();
      } catch (destroyErr) {
        // ignore
      }
    }
    client = null;
    // Auto-retry initialization after 6 seconds
    setTimeout(initWhatsApp, 6000);
  });
};



const getStatus = () => ({
  isReady,
  isInitializing,
  hasQR: !!qrCodeData,
  qrCode: qrCodeData
});

const sendMessage = async (phone, message) => {
  if (!isReady || !client) {
    throw new Error('WhatsApp client not ready. Please scan QR code first.');
  }

  // Format phone: ensure 91XXXXXXXXXX@c.us format
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
  const chatId = `${cleanPhone}@c.us`;

  await client.sendMessage(chatId, message);
  return true;
};

const sendMedia = async (phone, media, caption) => {
  if (!isReady || !client) {
    throw new Error('WhatsApp client not ready. Please scan QR code first.');
  }

  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
  const chatId = `${cleanPhone}@c.us`;

  await client.sendMessage(chatId, media, { caption });
  return true;
};

// Auto-initialize on require
initWhatsApp();

module.exports = { getStatus, sendMessage, sendMedia, initWhatsApp };

