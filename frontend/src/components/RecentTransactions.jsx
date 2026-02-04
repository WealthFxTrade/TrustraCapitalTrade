// src/components/RecentTransactions.jsx
import React from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function RecentTransactions({
  transactions = [],
  isLoading = false,
  maxItems = 5,
}) {
  // Helper: determine transaction type & direction
  const getTxInfo = (tx) => {
    const amount = Number(tx.amount || 0);
    const typeLower = (tx.type || '').toLowerCase();

    const isDeposit =
      typeLower === 'deposit' ||
      typeLower === 'credit' ||
      amount > 0 ||
      tx.direction === 'in';

    return {
      isDeposit,
      sign: isDeposit ? '+' : '-',
      color: isDeposit ? 'emerald' : 'rose',
      icon: isDeposit ? ArrowDownLeft : ArrowUpRight,
      typeDisplay: tx.type
        ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1).toLowerCase()
        : isDeposit
        ? 'Deposit'
        : 'Withdrawal',
    };
  };

  // Helper: format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid date';

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Status styling & icon
  const getStatusInfo = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'completed' || s === 'approved' || s === 'success') {
      return {
        label: 'Completed',
        color: 'emerald',
        icon: CheckCircle2,
      };
    }
    if (s === 'failed' || s === 'rejected' || s === 'cancelled') {
      return {
        label: 'Failed',
        color: 'rose',
        icon: AlertCircle,
      };
    }
    return {
      label: 'Pending',
      color: 'amber',
      icon: Clock,
    };
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 sm:mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Recent Activity
        </h2>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-950 px-3 py-1 rounded-full border border-slate-700">
          Last {maxItems} Transactions
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-slate-800/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-slate-500">
          <Clock className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-base font-medium">No transactions yet</p>
          <p className="text-sm mt-2 opacity-80">
            Your recent deposits, withdrawals, and transfers will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2 sm:-mx-0">
          <table className="w-full min-w-[600px] text-left border-separate border-spacing-y-1">
            <thead>
              <tr className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-4 pl-3 sm:pl-4">Type</th>
                <th className="pb-4">Amount</th>
                <th className="pb-4 hidden md:table-cell">Date</th>
                <th className="pb-4 pr-3 sm:pr-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transactions.slice(0, maxItems).map((tx, index) => {
                const { isDeposit, sign, color, icon: TypeIcon, typeDisplay } =
                  getTxInfo(tx);
                const { label: statusLabel, color: statusColor, icon: StatusIcon } =
                  getStatusInfo(tx.status);

                return (
                  <tr
                    key={tx._id || index}
                    className="group hover:bg-slate-800/40 transition-colors rounded-xl"
                  >
                    <td className="py-3.5 pl-3 sm:pl-4 rounded-l-xl">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isDeposit
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          <TypeIcon size={18} />
                        </div>
                        <span className="font-semibold text-slate-200 capitalize">
                          {typeDisplay}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 font-mono font-bold">
                      <span className={`${color}-400`}>
                        {sign}$
                        {Math.abs(Number(tx.amount || 0)).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 text-slate-400 text-sm hidden md:table-cell">
                      {formatDate(tx.createdAt || tx.date)}
                    </td>

                    <td className="py-3.5 pr-3 sm:pr-4 text-right rounded-r-xl">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${
                          statusColor === 'emerald'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : statusColor === 'rose'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        <StatusIcon size={14} />
                        {statusLabel}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
