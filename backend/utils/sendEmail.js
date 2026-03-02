import nodemailer from 'nodemailer';

export const sendEmail = async ({ email, subject, message, otp }) => {
  if (!email || !subject || (!message && !otp)) {
    throw new Error('Email, subject, and message/otp are required.');
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_PORT === '465',
      auth: { 
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS 
      },
      // Pool connections for high-frequency OTP requests
      pool: true,
      maxConnections: 5,
    });

    // 2026 High-Security Template for OTP
    const htmlContent = otp ? `
      <div style="background:#020408; color:#fff; padding:40px; font-family:sans-serif; border-radius:20px; border:1px solid #333;">
        <h1 style="color:#eab308; font-style:italic; letter-spacing:-1px; margin-bottom:20px;">TRUSTRA CAPITAL</h1>
        <p style="opacity:0.8; font-size:16px;">${message || 'Action Required: Authorization Code'}</p>
        <div style="background:rgba(255,255,255,0.05); padding:30px; border-radius:16px; margin:25px 0; text-align:center; border:1px dashed rgba(234,179,8,0.3);">
          <span style="font-size:36px; font-weight:900; letter-spacing:12px; color:#eab308;">${otp}</span>
        </div>
        <p style="font-size:11px; opacity:0.4; line-height:1.6;">
          Security Protocol: AES-256 Verified Handshake<br/>
          This code expires in 5 minutes. Node: Trustra-Alpha-01
        </p>
      </div>` : message;

    const info = await transporter.sendMail({
      from: `"Trustra Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject || "Security Protocol Update",
      html: htmlContent
    });

    console.log('📧 Protocol Dispatched:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email Handshake Failed:', error);
    throw new Error('SMTP Configuration Error - Check Terminal .env');
  }
};

