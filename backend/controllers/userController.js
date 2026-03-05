import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import crypto from 'crypto';

// ── 1. INVESTOR PROTOCOLS (FINANCIAL ENGINE) ──

/**
 * @protocol compoundYield
 * @description Moves ROI (Profit) into EUR (Principal) for exponential compounding.
 */
export const compoundYield = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "Investor identity not found.");

    const currentRoi = user.balances.get('ROI') || 0;
    const currentEur = user.balances.get('EUR') || 0;
    const minCompound = 10;

    if (currentRoi < minCompound) {
      return res.status(400).json({
        success: false,
        message: `Insufficient Yield. Minimum €${minCompound} required.`
      });
    }

    // Atomic Transfer: ROI -> EUR
    user.balances.set('ROI', 0);
    user.balances.set('EUR', currentEur + currentRoi);

    // Record in Internal Ledger for auditing
    user.ledger.push({
      amount: currentRoi,
      currency: 'EUR',
      type: 'yield',
      status: 'completed',
      description: 'Internal Protocol Compounding: ROI to Principal'
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Compound Protocol Successful.",
      balances: Object.fromEntries(user.balances)
    });
  } catch (err) { next(err); }
};

/**
 * @protocol requestWithdrawal
 * @description Logs a pending off-ramp request for admin approval.
 */
export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, currency, address } = req.body;
    const user = await User.findById(req.user._id);

    const currentRoi = user.balances.get('ROI') || 0;
    const minWithdrawal = 50;

    if (amount < minWithdrawal) {
      return res.status(400).json({ success: false, message: `Minimum withdrawal is €${minWithdrawal}.` });
    }

    if (amount > currentRoi) {
      return res.status(400).json({ success: false, message: "Insufficient yield node liquidity." });
    }

    // Deduct immediately (Lock funds) to prevent double-spending during verification
    user.balances.set('ROI', currentRoi - amount);

    user.ledger.push({
      amount: parseFloat(amount),
      currency: currency,
      address: address,
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal Request to ${address}`
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Withdrawal request transmitted to Zurich HQ.",
      balances: Object.fromEntries(user.balances)
    });
  } catch (err) { next(err); }
};

// ── 2. USER SCOPED LOGIC (PROFILE & SECURITY) ──

/**
 * @protocol getUserProfile
 * @description Fetches investor data, excluding sensitive credentials.
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

/**
 * @protocol updatePassword
 * @description Updates security credentials. Note: Password hashing happens in User model pre-save hook.
 */
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.password = req.body.password; 
    await user.save();
    res.status(200).json({ success: true, message: "Security Protocol Updated" });
  } catch (err) { next(err); }
};

/**
 * @protocol getMyDepositAddress
 * @description Serves deterministic BTC/ETH vault addresses.
 */
export const getMyDepositAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Auto-generate deterministic addresses based on email hash if null
    if (!user.btcAddress || !user.ethAddress) {
      const hash = crypto.createHash('sha256').update(user.email).digest('hex');
      user.btcAddress = user.btcAddress || `bc1q${hash.substring(0, 38)}`;
      user.ethAddress = user.ethAddress || `0x${hash.substring(0, 40)}`;
      await user.save();
    }

    res.status(200).json({
      success: true,
      btcAddress: user.btcAddress,
      ethAddress: user.ethAddress,
      addresses: { BTC: user.btcAddress, ETH: user.ethAddress } // Legacy support
    });
  } catch (err) { next(err); }
};

/**
 * @protocol getYieldHistory
 * @description Generates the last 7 days of yield data for dashboard charts.
 */
export const getYieldHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('ledger');
    const logs = user.ledger
      .filter(entry => entry.type === 'yield' || entry.type === 'PROFIT')
      .slice(-7);

    const history = logs.map(log => ({
      day: new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      yield: Number(log.amount.toFixed(2))
    }));

    res.status(200).json({ success: true, history });
  } catch (err) { next(err); }
};

// ── 3. ADMINISTRATIVE OVERRIDES (ZURICH HQ ACCESS) ──

/**
 * @protocol getAllUsers
 * @access Admin Only (Restricted to 'admin' role)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) { next(err); }
};

/**
 * @protocol updateUser
 * @access Admin Only
 * @description Allows manual override of node status, roles, and balances.
 */
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "Node not found in registry");

    const fields = ['username', 'email', 'role', 'isVerified', 'isBanned', 'balances'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Handle Map updates for balances specifically
        if (field === 'balances') {
          Object.keys(req.body.balances).forEach(key => {
            user.balances.set(key, req.body.balances[key]);
          });
        } else {
          user[field] = req.body[field];
        }
      }
    });

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

/**
 * @protocol deleteUser
 * @access Admin Only
 * @description Hard-purges an investor node from the registry.
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new ApiError(404, "Target already redacted or missing.");
    res.status(200).json({ success: true, message: "User redacted from registry" });
  } catch (err) { next(err); }
};
