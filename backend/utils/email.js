// backend/utils/email.js
import nodemailer from 'nodemailer';

const sendVerificationEmail = async (user, token) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationUrl = `\( {process.env.FRONTEND_URL}/verify-email/ \){token}`;

  const mailOptions = {
    from: `"TrustraCapitalTrade" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Verify Your Email Address',
    html: `
      <h2>Welcome to TrustraCapitalTrade!</h2>
      <p>Hello ${user.fullName},</p>
      <p>Thank you for signing up. Please verify your email to activate your account.</p>
      <p>Click the button below to verify:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Verify Email
      </a>
      <p style="margin-top: 20px;">Or copy and paste this link in your browser:</p>
      <p><a href="\( {verificationUrl}"> \){verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
      <p>Best regards,<br>TrustraCapitalTrade Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${user.email}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send verification email');
  }
};

export default sendVerificationEmail;
