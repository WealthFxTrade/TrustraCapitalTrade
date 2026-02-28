import nodemailer from 'nodemailer';
import twilio from 'twilio';

/**
 * Trustra Email & SMS Protocol v8.4.2
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // True for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Initialize Twilio Client (from your package.json dependencies)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * ─── PASSWORD RESET PROTOCOL ───
 */
export const sendResetEmail = async (email, token) => {
  // Corrected URL syntax to include the separator
  const resetUrl = `https://trustra-capital-trade.vercel.app/reset-password/${token}`;

  const mailOptions = {
    from: `"Trustra Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Action Required: Password Reset Request',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; color: #0f172a;">
        <h1 style="color: #eab308;">Trustra Capital Trade</h1>
        <p>A password reset was requested for your secure node.</p>
        <div style="padding: 20px; background: #f8fafc; border-radius: 12px; margin: 20px 0;">
          <a href="${resetUrl}" style="background: #eab308; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 12px; color: #64748b;">This link expires in 60 minutes. If you did not request this, please secure your account immediately.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

/**
 * ─── DEPOSIT & TRANSACTION SMS ───
 */
export const sendTransactionSMS = async (phone, amount, asset) => {
  try {
    if (!phone) return;

    const message = `[Trustra] Deposit Confirmed: ${amount} ${asset} has been credited to your node. Portfolio balance updated.`;

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    console.log(`✅ SMS Alert Dispatched to ${phone}`);
  } catch (err) {
    console.error(`❌ SMS Protocol Failure: ${err.message}`);
  }
};
