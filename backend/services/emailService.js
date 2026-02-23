import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (email, token) => {
  const resetUrl = `https://trustra-capital-trade.vercel.app{token}`;
  
  const mailOptions = {
    from: `"Trustra Capital" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `<h1>Reset Your Password</h1>
           <p>Click the link below to reset your password. Valid for 1 hour.</p>
           <a href="${resetUrl}">${resetUrl}</a>`
  };

  return transporter.sendMail(mailOptions);
};

