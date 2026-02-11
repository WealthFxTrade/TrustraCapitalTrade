import crypto from 'crypto';
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

    if (!email) {
      throw new ApiError(400, 'Please provide an email address');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    // 🔒 Silent success to prevent account enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists, a reset link has been dispatched.'
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before storing
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Store hashed token in schema fields
    user.resetOtp = hashedToken;
    user.resetOtpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save({ validateBeforeSave: false });

    const frontendUrl =
      process.env.FRONTEND_URL || 'https://trustracapital.vercel.app';

    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const htmlMessage = `
      <div style="font-family: sans-serif; max-width:600px; margin:auto; padding:20px; background:#05070a; color:#ffffff;">
        <h2 style="color:#3b82f6;">Trustra Capital</h2>
        <p>Password reset requested.</p>
        <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">
          Reset Password
        </a>
        <p style="font-size:12px;color:#94a3b8;margin-top:20px;">
          This link expires in 15 minutes.
        </p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message: htmlMessage
      });

      res.status(200).json({
        success: true,
        message: 'Reset link sent to registered email'
      });

    } catch (emailError) {
      // If email fails, remove reset token
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new ApiError(500, 'Email delivery failed. Try again later.');
    }

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

    if (!password || password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters');
    }

    // Hash the token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetOtp: hashedToken,
      resetOtpExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      throw new ApiError(400, 'Security token is invalid or has expired');
    }

    // Set new password (hashing handled by pre-save middleware)
    user.password = password;

    // Clear reset fields
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password successfully updated. Please log in.'
    });

  } catch (err) {
    next(err);
  }
};
