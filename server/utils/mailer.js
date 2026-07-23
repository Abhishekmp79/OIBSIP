/**
 * Nodemailer transport.
 *
 * Uses SMTP credentials from env. In development without real SMTP creds it
 * still resolves successfully (just won't actually deliver) so the app runs.
 */
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a templated email. Wraps nodemailer.sendMail and never throws — it logs
 * errors instead so email failures don't crash the request flow.
 */
async function sendMail({ to, subject, html }) {
  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM || 'Slice House <no-reply@slicehouse.com>',
      to,
      subject,
      html,
    });
    console.log(`[MAIL] sent "${subject}" -> ${to}`);
    return true;
  } catch (err) {
    console.error(`[MAIL] failed "${subject}" -> ${to}:`, err.message);
    return false;
  }
}

module.exports = { sendMail, transport };
