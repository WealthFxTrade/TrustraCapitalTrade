// src/pages/Admin/index.js
// Barrel export file for all Admin pages

// Main Admin Pages
export { default as AdminOverview } from './AdminOverview';
export { default as AdminSettings } from './AdminSettings';
export { default as SystemHealth } from './SystemHealth';
export { default as AdminTerminal } from './AdminTerminal';

// User Management
export { default as AdminUserTable } from './AdminUserTable';
export { default as AdminUserList } from './AdminUserList';     // if you have both
export { default as UserIdentityDetail } from './UserIdentityDetail';

// KYC Management
export { default as KycVerificationQueue } from './KycVerificationQueue';
export { default as KYCManager } from './KYCManager';

// Deposits & Withdrawals
export { default as DepositRequestsTable } from './DepositRequestsTable';
export { default as WithdrawalRequestsTable } from './WithdrawalRequestsTable';

// Others
export { default as AuditLogTable } from './AuditLogTable';
export { default as WithdrawalForm } from './WithdrawalForm';
