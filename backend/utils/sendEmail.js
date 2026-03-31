// backend/utils/sendEmail.js
import nodemailer from 'nodemailer';

/**
 * Professional Email Service for Trustra Capital Trade
 * Clean, secure, and maintainable version
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!to || !subject || (!html && !text)) {
    throw new Error('Missing required email fields: to, subject, and content');
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,
      maxConnections: 5,
      // Optional: Add TLS options for better security
      tls: {
        rejectUnauthorized: true,
      },
    });

    // Verify transporter connection
    await transporter.verify();

    const mailOptions = {
      from: `"Trustra Capital Trade" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: html || undefined,
      text: text || undefined,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to \( {to} | MessageId: \){info.messageId}`);
    return info;

  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendEmail;
