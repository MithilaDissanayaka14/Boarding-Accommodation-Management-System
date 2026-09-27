const nodemailer = require('nodemailer');
const logger = require('./logger');

// Check if SMTP is configured in environment variables
const isSmtpConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

let transporter = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  logger.info('Nodemailer SMTP transport initialized.');
} else {
  logger.info('SMTP credentials not fully configured. Email OTPs will be logged to server console for development.');
}

/**
 * Common HTML email template wrapper
 */
const renderEmailTemplate = ({ title, preheader, bodyHtml, otp }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
      }
      .wrapper {
        width: 100%;
        max-width: 560px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
      }
      .header {
        background: linear-gradient(135deg, #3B71FE 0%, #1D4ED8 100%);
        padding: 32px 24px;
        text-align: center;
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .header p {
        margin: 6px 0 0 0;
        font-size: 13px;
        opacity: 0.85;
      }
      .content {
        padding: 32px 28px;
        line-height: 1.6;
        font-size: 15px;
      }
      .otp-box {
        margin: 28px 0;
        padding: 20px;
        background: #f8fafc;
        border: 2px dashed #cbd5e1;
        border-radius: 12px;
        text-align: center;
      }
      .otp-code {
        font-size: 34px;
        font-weight: 800;
        letter-spacing: 8px;
        color: #2563eb;
        font-family: 'Courier New', Courier, monospace;
      }
      .otp-timer {
        margin-top: 8px;
        font-size: 13px;
        color: #64748b;
        font-weight: 600;
      }
      .footer {
        padding: 20px 24px;
        text-align: center;
        font-size: 12px;
        color: #94a3b8;
        background: #fafafa;
        border-top: 1px solid #f1f5f9;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>UniStay</h1>
        <p>Student Boarding & Accommodation Management</p>
      </div>
      <div class="content">
        <h2 style="margin-top: 0; font-size: 20px; color: #0f172a;">${title}</h2>
        ${bodyHtml}
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="otp-timer">Expires in 10 minutes</div>
        </div>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
          If you did not request this verification code, please ignore this email or secure your account.
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} UniStay (BAMS). All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Send Email Verification OTP
 */
const sendVerificationOtpEmail = async ({ to, name, otp }) => {
  const subject = `UniStay - Your Email Verification Code is ${otp}`;
  const html = renderEmailTemplate({
    title: 'Verify Your Email Address',
    preheader: `Your verification code is ${otp}`,
    bodyHtml: `
      <p>Hello <strong>${name || 'there'}</strong>,</p>
      <p>Thank you for joining UniStay. Please use the following 6-digit One-Time Password (OTP) to verify your account email address:</p>
    `,
    otp,
  });

  // Always log OTP to server console for testing/debugging
  console.log(`\n======================================================`);
  console.log(`📧 [EMAIL VERIFICATION OTP]`);
  console.log(`To: ${to}`);
  console.log(`Code: ${otp}`);
  console.log(`Valid for: 10 minutes`);
  console.log(`======================================================\n`);

  if (transporter) {
    try {
      const from = process.env.EMAIL_FROM || '"UniStay" <noreply@unistay.lk>';
      await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      logger.info(`Verification OTP email successfully dispatched to ${to}`);
    } catch (err) {
      logger.error(`Error sending email to ${to}:`, err);
    }
  }
};

/**
 * Send Password Reset OTP
 */
const sendPasswordResetOtpEmail = async ({ to, name, otp }) => {
  const subject = `UniStay - Your Password Reset Code is ${otp}`;
  const html = renderEmailTemplate({
    title: 'Reset Your UniStay Password',
    preheader: `Your password reset code is ${otp}`,
    bodyHtml: `
      <p>Hello <strong>${name || 'there'}</strong>,</p>
      <p>We received a request to reset your UniStay account password. Enter the 6-digit OTP code below to verify your identity and set a new password:</p>
    `,
    otp,
  });

  // Always log OTP to server console for testing/debugging
  console.log(`\n======================================================`);
  console.log(`🔑 [PASSWORD RESET OTP]`);
  console.log(`To: ${to}`);
  console.log(`Code: ${otp}`);
  console.log(`Valid for: 10 minutes`);
  console.log(`======================================================\n`);

  if (transporter) {
    try {
      const from = process.env.EMAIL_FROM || '"UniStay" <noreply@unistay.lk>';
      await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      logger.info(`Password reset OTP email successfully dispatched to ${to}`);
    } catch (err) {
      logger.error(`Error sending password reset email to ${to}:`, err);
    }
  }
};

module.exports = {
  sendVerificationOtpEmail,
  sendPasswordResetOtpEmail,
};
