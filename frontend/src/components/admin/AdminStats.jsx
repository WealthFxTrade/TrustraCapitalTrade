import React from 'react';
import { useAdminLive } from '../../context/AdminLiveContext';
import { 
  BanknotesIcon, 
  CurrencyEuroIcon, 
  UserGroupIcon, 
  QueueListIcon 
} from '@heroicons/react/24/solid';

const AdminStats = () => {
  const { adminStats, onlineAdmins } = useAdminLive();

  const statsConfig = [
    {
      title: "Total BTC Deposited",
      value: `${adminStats.totalDepositedBtc?.toFixed(4)} BTC`,
      icon: <BanknotesIcon className="h-6 w-6 text-orange-500" />,
      bg: "bg-orange-500/10",
      border: "border-orange-500/20"
    },
    {
      title: "Pending Withdrawals",
      value: adminStats.pendingWithdrawals || 0,
      icon: <QueueListIcon className="h-6 w-6 text-red-500" />,
      bg: "bg-red-500/10",
      border: "border-red-500/20"
    },
    {
      title: "Active Investors",
      value: adminStats.activeUsers || 0,
      icon: <UserGroupIcon className="h-6 w-6 text-blue-500" />,
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "Online Admins",
      value: onlineAdmins || 1,
      icon: <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />,
      bg: "bg-green-500/10",
      border: "border-green-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsConfig.map((stat, index) => (
        <div 
          key={index} 
          className={`p-5 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm transition-all hover:scale-[1.02]`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                {stat.title}
              </p>
              <h4 className="text-2xl font-bold text-white tabular-nums">
                {stat.value}
              </h4>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-xl shadow-inner">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;

