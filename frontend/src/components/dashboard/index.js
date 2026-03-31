/**
 * TRUSTRA CAPITAL - COMPONENT REGISTRY
 * MARCH 2026 PRODUCTION BUILD v8.6.1
 */

// Core Layout & Navigation
export { default as DashboardHeader } from './DashboardHeader.jsx';
export { default as UserDashboard } from './UserDashboard.jsx';

// Financial Displays
export { default as WalletDisplay } from './WalletDisplay.jsx';
export { default as PortfolioValue } from './PortfolioValue.jsx';
export { default as AssetCard } from './AssetCard.jsx';
export { default as AccountSummary } from './AccountSummary.jsx';
export { default as StatsGrid } from './StatsGrid.jsx';

// Charts & Analytics
export { default as TradingChart } from './TradingChart.jsx';
export { default as DashboardChart } from './DashboardChart.jsx';
export { default as GrowthChart } from './GrowthChart.jsx';

// Transaction & Activity Management
export { default as RecentTransactions } from './RecentTransactions.jsx';
export { default as RecentActivity } from './RecentActivity.jsx';
export { default as ActivityLedger } from './ActivityLedger.jsx';
export { default as WithdrawalRequest } from './WithdrawalRequest.jsx';

// Administrative & Management Modals
export { default as ProfileSettings } from './ProfileSettings.jsx';
export { default as ProfileSettingsModal } from './ProfileSettingsModal.jsx';
export { default as BalanceEditorModal } from './BalanceEditorModal.jsx';

// System Utilities
export { default as MarketFeed } from './MarketFeed.jsx';
export { default as Skeleton } from './Skeleton.jsx';

/** * END OF REGISTRY 
 * Ensure all new components are exported here to maintain 
 * clean imports throughout the application.
 */
