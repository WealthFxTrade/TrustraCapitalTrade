import nodemailer from 'nodemailer';

export const sendEmail = async ({ email, subject, message }) => {
  if (!email || !subject || !message) throw new Error('Email, subject, and message are required.');

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const info = await transporter.sendMail({
      from: `"Trustra Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html: message
    });

    console.log('📧 Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send email. Check SMTP configuration.');
  }
};
