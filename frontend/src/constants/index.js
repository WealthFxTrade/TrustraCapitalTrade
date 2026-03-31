// src/constants/index.js - UI and System Configuration

export const APP_NAME = "Trustra Capital Trade";
export const APP_VERSION = "v2.4.0-PROD";

// Navigation Structure for the User Dashboard
export const NAV_LINKS = [
  { name: 'Terminal', path: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Assets', path: '/wallet', icon: 'Wallet' },
  { name: 'Exchange', path: '/trade', icon: 'TrendingUp' },
  { name: 'Security', path: '/security', icon: 'ShieldCheck' },
  { name: 'Verification', path: '/kyc', icon: 'Fingerprint' },
];

// Admin Command Center Links
export const ADMIN_NAV_LINKS = [
  { name: 'Node Health', path: '/admin/health', icon: 'Activity' },
  { name: 'User Registry', path: '/admin/users', icon: 'Users' },
  { name: 'Financial Ledger', path: '/admin/ledger', icon: 'BookOpen' },
  { name: 'Withdrawal Queue', path: '/admin/withdrawals', icon: 'ArrowDownCircle' },
];

// Transaction Status Mapping
export const STATUS_VARIANTS = {
  pending: { label: 'PENDING', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  completed: { label: 'SUCCESS', color: 'text-green-500', bg: 'bg-green-500/10' },
  failed: { label: 'REJECTED', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  processing: { label: 'SYNCING', color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

// Site-wide metadata for SEO/Head tags
export const META_DATA = {
  description: "Global Access Protocol for Institutional Digital Asset Trading.",
  security: "AES-256 Encrypted Nodes",
};

