/**
 * TRUSTRA CAPITAL TRADE - API LAYER ENTRY POINT
 * Finalized for 2026 Production Environment
 *
 * This file serves as the single public API surface for all backend communication.
 * All components/pages should ONLY import from this file — never directly from submodules.
 *
 * Usage example:
 *   import { login, getUserProfile, submitDeposit } from '@/api';
 */

// ────────────────────────────────────────────────
// 1. Core Engine (Axios instance + interceptors)
// ────────────────────────────────────────────────
/**
 * Pre-configured axios instance with:
 *  - Base URL from env
 *  - Bearer token injection
 *  - 401 → auto logout / refresh token logic
 *  - Request/response interceptors
 *  - Timeout & retry configuration
 */
export { default as api } from './apiService';

// ────────────────────────────────────────────────
// 2. Authentication
// ────────────────────────────────────────────────
export {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,       // often used after login to hydrate auth context
} from './auth';

// ────────────────────────────────────────────────
// 3. Financial Operations (Deposits, Withdrawals, History)
// ────────────────────────────────────────────────
export {
  createDeposit,
  getDepositMethods,
  getDepositHistory,
  createWithdrawal,
  getWithdrawalMethods,
  getWithdrawalHistory,
  getTransactionHistory,   // unified view (deposits + withdrawals + trades)
  getUserBalance,
} from './transactions';

// ────────────────────────────────────────────────
// 4. User / Investor Profile & KYC
// ────────────────────────────────────────────────
export {
  getUserProfile,
  updateUserProfile,
  uploadKycDocument,
  getKycStatus,
  submitKycVerification,
  getInvestmentPlans,
  subscribeToPlan,
  getUserSubscriptions,
} from './user';

// ────────────────────────────────────────────────
// 5. Admin / Management Endpoints
// ────────────────────────────────────────────────
export {
  // User management
  getAllUsers,
  updateUserAdmin,
  deleteUserAdmin,

  // KYC queue
  getPendingKyc,
  approveKyc,
  rejectKyc,

  // Platform stats & monitoring
  getAdminStats,
  getPlatformOverview,
  getRecentTransactionsAdmin,
} from './admin';

// ────────────────────────────────────────────────
// Optional: Type Exports (if using TypeScript)
// ────────────────────────────────────────────────
// export type {
//   UserProfile,
//   Transaction,
//   DepositPayload,
//   KycStatus,
//   AdminStats,
// } from './types';
