/**
 * POST /api/auth/login
 * Validates credentials and returns a session token.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ── 1. Input Validation ──────────────────
    if (!email || !password) {
      throw new ApiError(400, 'Protocol Email and Access Cipher are required');
    }

    // ── 2. Find User ─────────────────────────
    // We explicitly select '+password' because it's hidden by default in the User Schema
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid Access Cipher or Email');
    }

    // ── 3. Verify Password ───────────────────
    // Assumes you have a comparePassword method on your User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid Access Cipher or Email');
    }

    // ── 4. Verify Account Status ─────────────
    if (!user.isActive) {
      throw new ApiError(403, 'Account protocol suspended. Contact administration.');
    }

    // ── 5. Generate Token & Respond ──────────
    const token = signToken(user);

    res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user)
    });

  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Restores session based on JWT from the Protect middleware.
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is populated by the 'protect' middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      throw new ApiError(404, 'User protocol not found');
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (err) {
    next(err);
  }
};
