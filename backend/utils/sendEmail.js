import nodemailer from 'nodemailer';

/**
 * @desc Professional SMTP Dispatcher for Trustra Protocol
 */
const sendEmail = async ({ email, subject, message, otp }) => {
  if (!email || !subject || (!message && !otp)) {
    throw new Error('Email, subject, and message/otp are required.');
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, 
      port: Number(process.env.EMAIL_PORT) || 587,
      // Secure is true for port 465, false for other ports (like 587)
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
      },
      pool: true,
      maxConnections: 5,
    });

    // ── 2026 HIGH-SECURITY HTML TEMPLATE ──
    const htmlContent = otp ? `
      <div style="background:#020408; color:#ffffff; padding:40px; font-family:sans-serif; border:1px solid #eab308; border-radius:10px; max-width: 600px; margin: auto;">
        <h1 style="color:#eab308; font-style:italic; letter-spacing:-1px; margin-bottom:20px; text-transform:uppercase;">Trustra Security</h1>
        <p style="opacity:0.8; font-size:16px;">${message || 'Action Required: Authorization Code'}</p>
        <div style="background:rgba(255,255,255,0.05); padding:30px; border-radius:16px; margin:25px 0; text-align:center; border:1px dashed rgba(234,179,8,0.3);">
          <span style="font-size:36px; font-weight:900; letter-spacing:12px; color:#eab308;">${otp}</span>
        </div>
        <p style="font-size:11px; opacity:0.4; line-height:1.6; text-transform:uppercase;">
          Security Protocol: AES-256 Verified Handshake<br/>
          This code expires in 10 minutes. Node: Zurich-Mainnet-01
        </p>
      </div>` : `
      <div style="background:#020408; color:#ffffff; padding:40px; font-family:sans-serif; border:1px solid #333; max-width: 600px; margin: auto;">
        <h1 style="color:#eab308; text-transform:uppercase;">Protocol Initialized</h1>
        <div style="margin:20px 0; line-height:1.6;">${message}</div>
        <footer style="margin-top:40px; font-size:10px; color:#444; text-transform:uppercase; letter-spacing:2px;">
          Trustra Capital • Institutional Terminal • v8.6
        </footer>
      </div>`;

    const info = await transporter.sendMail({
      from: `"Trustra Security" <${process.env.EMAIL_USER}>`,
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

export default sendEmail; // 🛰️ Changed to default export to match authController
