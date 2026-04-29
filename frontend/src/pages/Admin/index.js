// src/pages/Admin/index.js
export { default as AdminOverview } from './AdminOverview';
export { default as AdminUserTable } from './AdminUserList'; // New File for User Management
export { default as UserIdentityDetail } from './UserIdentityDetail';
export { default as KycVerificationQueue } from './AdminUserTable'; // Existing file has KYC logic
export { default as DepositRequestsTable } from './DepositRequestsTable';
export { default as WithdrawalRequestsTable } from './WithdrawalRequestsTable';
export { default as AdminSettings } from './AdminSettings';
export { default as SystemHealth } from './SystemHealth';

