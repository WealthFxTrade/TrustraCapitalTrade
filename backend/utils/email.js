import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `\( {process.env.FRONTEND_URL}/verify-email/ \){token}`;

  await transporter.sendMail({
    from: `"TrustraCapitalTrade" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Verify Your Email Address',
    html: `
      <h2>Welcome, ${user.fullName}!</h2>
      <p>Thank you for registering. Please click the button below to verify your email:</p>
      <a href="${verificationUrl}" style="display:inline-block; padding:12px 24px; background:#6366f1; color:white; text-decoration:none; border-radius:6px;">
        Verify Email
      </a>
      <p style="margin-top:20px;">Or copy this link: ${verificationUrl}</p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't sign up, ignore this email.</p>
      <p>TrustraCapitalTrade Team</p>
    `
  });

  console.log(`Verification email sent to ${user.email}`);
};
