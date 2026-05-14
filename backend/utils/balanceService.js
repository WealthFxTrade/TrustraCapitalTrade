// backend/utils/balanceService.js
import User from '../models/User.js';
import { getAssetPriceEur } from './cryptoPrices.js';
import { createDoubleEntry } from './doubleEntry.js';
import ApiError from './ApiError.js';

/**
 * ============================================================================
 * BALANCE VALIDATION & MATH NORMALIZERS
 * ============================================================================
 */

/**
 * Validates if an asset ticker is supported by the system architecture
 * @param {String} currency - Asset symbol (e.g., 'EUR', 'BTC', 'ETH', 'USDT')
 * @returns {Boolean} True if supported
 */
export const isSupportedAsset = (currency) => {
  const supported = ['EUR', 'BTC', 'ETH', 'USDT', 'INVESTED', 'TOTAL_PROFIT'];
  return supported.includes(currency.toUpperCase().trim());
};

/**
 * Safely forces a numeric calculation float boundary to prevent precision errors
 * @param {Number} value - The input float number 
 * @param {Number} precision - Decimal places (default 8 for crypto, 2 for fiat)
 * @returns {Number} Normalized finite float number
 */
export const normalizePrecision = (value, precision = 8) => {
  const num = parseFloat(value);
  return isNaN(num) || !isFinite(num) ? 0 : Number(num.toFixed(precision));
};

/**
 * ============================================================================
 * CORE USER BALANCE TRANSACTION UTILITIES
 * ============================================================================
 */

/**
 * Modifies an absolute user balance sub-object field securely inside the database.
 * Eliminates old Map abstractions (.get/.set) to prevent runtime TypeErrors.
 * 
 * @param {Object} params
 * @param {String} params.userId - Target user database ID index
 * @param {String} params.currency - Token target (e.g. 'BTC', 'ETH', 'EUR')
 * @param {Number} params.amount - Numeric magnitude value of capital adjustment
 * @param {String} params.operationType - Mathematical modifier switch ('credit' or 'debit')
 * @param {String} params.balanceField - Sub-field scope target (e.g. 'available' or 'locked')
 * @returns {Object} Updated User document instance
 */
export const adjustUserBalance = async ({
  userId,
  currency,
  amount,
  operationType,
  balanceField = 'available'
}) => {
  const asset = currency.toUpperCase().trim();
  const magnitude = parseFloat(amount);

  if (!userId || isNaN(magnitude) || magnitude <= 0) {
    throw new ApiError(400, 'Invalid parameters or amount supplied for balance mutation pipeline.');
  }

  if (!isSupportedAsset(asset)) {
    throw new ApiError(400, `Digital crypto asset ticker [${asset}] is not supported by this vault node.`);
  }

  // Determine the true nested sub-field text key path name configuration dynamically
  let targetFieldKey = asset;
  if (balanceField === 'locked') {
    if (['INVESTED', 'TOTAL_PROFIT'].includes(asset)) {
      throw new ApiError(400, `System operational tracker metrics cannot be placed into a locked buffer.`);
    }
    targetFieldKey = `LOCKED_${asset}`;
  }

  // Fetch target user without omitting password fields if controllers require them later
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Target platform user profile profile trace absent.');
  }

  // PRODUCTION STABILITY FIX: Initialize parameter safety hooks if fields are absent
  if (user.balances[targetFieldKey] === undefined) {
    user.balances[targetFieldKey] = 0;
  }

  const currentBalanceValue = Number(user.balances[targetFieldKey] || 0);
  const decimalBoundary = ['EUR', 'TOTAL_PROFIT'].includes(asset) ? 2 : 8;

  let computedFinalBalance = 0;
  if (operationType === 'credit') {
    computedFinalBalance = normalizePrecision(currentBalanceValue + magnitude, decimalBoundary);
  } else if (operationType === 'debit') {
    computedFinalBalance = normalizePrecision(currentBalanceValue - magnitude, decimalBoundary);
  } else {
    throw new ApiError(400, 'Invalid operational modifier token. Must specify credit or debit execution tracks.');
  }

  // Block malicious client or broken database sub-zero arithmetic modifications
  if (computedFinalBalance < 0) {
    throw new ApiError(400, `Operation aborted. Ledger adjustment triggers an illegal sub-zero capital state [${computedFinalBalance}] on wallet.`);
  }

  // Assign the finalized computation directly back to the flat sub-object property path
  user.balances[targetFieldKey] = computedFinalBalance;
  user.markModified('balances');
  
  await user.save();
  return user;
};

/**
 * Executes a high-security balanced admin adjustment trail across user profiles.
 * Seamlessly integrates with the underlying Double-Entry bookkeeping transaction engine.
 * 
 * @param {Object} params
 * @param {String} params.userId - Target user database footprint ID
 * @param {String} params.type - 'credit' or 'debit' tracking descriptors
 * @param {String} params.currency - Target fiat or crypto asset parameter string
 * @param {Number} params.amount - Numeric magnitude indicator value
 * @param {String} params.description - Intent statement rationale audit trace text
 * @param {String} params.adminId - Admin execution agent identifier signature
 * @returns {Object} Finalized balance state and currency context details
 */
export const executeAdminBalanceOverride = async ({
  userId,
  type,
  currency,
  amount,
  description,
  adminId
}) => {
  const asset = currency.toUpperCase().trim();
  const numericAmount = parseFloat(amount);

  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new ApiError(400, 'Operational adjustment value must evaluate to a positive, finite float.');
  }

  // Execute atomic sub-object modifications safely 
  const updatedUser = await adjustUserBalance({
    userId,
    currency: asset,
    amount: numericAmount,
    operationType: type,
    balanceField: 'available'
  });

  // Calculate equivalent reference asset values across fiat parameters safely
  const marketConversionPrice = asset === 'EUR' ? 1 : await getAssetPriceEur(asset);
  if (!marketConversionPrice) {
    throw new ApiError(500, 'Unable to compute market conversion weights from external price feeds. Execution halted.');
  }

  const calculatedEurWorth = normalizePrecision(numericAmount * marketConversionPrice, 2);

  // PRODUCTION AUDIT trail FIX: Commit balanced records securely via the transactional accounting loop helper
  await createDoubleEntry({
    userId: updatedUser._id,
    amount: numericAmount,
    currency: asset,
    source: 'admin_adjustment',
    debitAccount: type === 'credit' ? 'SYSTEM_RESERVES_TREASURY_POOL' : `USER_WALLET_NODE_${asset}`,
    creditAccount: type === 'credit' ? `USER_WALLET_NODE_${asset}` : 'SYSTEM_RESERVES_TREASURY_POOL',
    description: `[MANUAL_ADMIN_ADJUSTMENT] performed by agent: ${adminId}. Reason: ${description || 'No statement provided.'}. Value parity: €${calculatedEurWorth}`
  });

  return {
    success: true,
    newBalance: updatedUser.balances[asset],
    asset,
    calculatedEurWorth
  };
};

