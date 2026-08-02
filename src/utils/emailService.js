// utils/emailService.js
const nodemailer = require('nodemailer');
const logger = require('../config/logger');

let transporter = null;

const isConfigured =
  process.env.EMAIL_HOST &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_USER !== 'dev@zerohunger.org';

if (isConfigured) {
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
      logger.warn(`[SMTP Warning] Could not send real email (${err.message}). Logging email locally instead.`);
    }
  }

  // Graceful fallback to console/Winston logger in local dev
  logger.info(`---------------------------------------------------`);
  logger.info(`[MOCK EMAIL DELIVERED]`);
  logger.info(`To: ${to}`);
  logger.info(`Subject: ${subject}`);
  logger.info(`Body snippet: ${html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').substring(0, 300)}...`);
  logger.info(`---------------------------------------------------`);

  return { messageId: 'mock-id-' + Date.now() };
}

module.exports = { sendEmail };
