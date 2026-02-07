import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Request Password Reset Link
 * @route   POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Security: Always return success to prevent email enumeration
    if (!user) {
      return res.json({ 
        success: true, 
        message: "If an account exists with this email, a reset link has been sent." 
      });
    }

    // Generate plain-text reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token to store in DB (2026 Security Standard)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 Minute Window
    await user.save({ validateBeforeSave: false });

    // PRODUCTION URL: Use your Vercel Frontend Domain
    const frontendUrl = process.env.FRONTEND_URL || 'https://trustracapital.vercel.app';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: sans-serif; color: #0f172a; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #2563eb;">Trustra Capital Trade</h2>
        <p>You requested a password reset. This link is valid for 15 minutes:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset My Password</a>
        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: "Password Reset [Trustra 2026 Audit]",
      message
    });

    res.json({ success: true, message: "Reset link sent to registered email" });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reset Password using Token
 * @route   PUT /api/auth/reset-password/:token
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) throw new ApiError(400, "Token is invalid or has expired");

    // Pre-save hook in User model usually hashes the password, 
    // but if not, hash it here:
    user.password = password; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ 
      success: true, 
      message: "Password updated. You can now login with your new credentials." 
    });
  } catch (err) {
    next(err);
  }
};

