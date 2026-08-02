// utils/emailService.js
const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'dev@zerohunger.org') {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ZeroHunger Team" <no-reply@zerohunger.org>',
    to,
    subject,
    html,
  };

  if (transporter) {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (err) {
      console.warn('[SMTP Warning] Could not send real email:', err.message);
    }
  }

  console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
  return { messageId: 'mock-id-' + Date.now() };
}

module.exports = { sendEmail };
