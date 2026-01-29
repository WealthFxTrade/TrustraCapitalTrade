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
  const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  await transporter.sendMail({
    from: `"TrustraCapitalTrade" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Verify Your Email',
    html: `<h2>Welcome, ${user.fullName}!</h2>
           <p>Click <a href="${url}">here</a> to verify your email.</p>`
  });
};
