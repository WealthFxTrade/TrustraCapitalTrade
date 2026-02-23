import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

export default function RecentTransactions({ transactions = [], isLoading = false, maxItems = 5 }) {
  
  const getTxDirection = (tx) => {
    const amount = Number(tx?.amount ?? 0);
    const typeLower = (tx?.type || '').toLowerCase();
    const isDeposit = typeLower === 'deposit' || typeLower === 'credit' || amount > 0;

    return {
      isDeposit,
      sign: isDeposit ? '+' : '-',
      color: isDeposit ? 'emerald' : 'rose',
      icon: isDeposit ? ArrowDownLeft : ArrowUpRight,
      label: tx?.type ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1).toLowerCase() : (isDeposit ? 'Deposit' : 'Withdrawal'),
    };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusDisplay = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (['completed', 'approved', 'success'].includes(s)) return { label: 'Completed', color: 'emerald', icon: CheckCircle2 };
    if (['failed', 'rejected', 'cancelled', 'error'].includes(s)) return { label: 'Failed', color: 'rose', icon: AlertCircle };
    return { label: 'Pending', color: 'amber', icon: Clock };
  };

  // SAFEGUARD: Ensure transactions is an array before slicing
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h2 className="text-xl font-bold text-white tracking-tight">Recent Activity</h2>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
          Syncing 2026 Ledger
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : safeTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Clock className="h-10 w-10 mb-3 opacity-20" />
          <p className="text-sm font-medium">No activity recorded</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="pb-2 pl-4">Type</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2 hidden md:table-cell">Date</th>
                <th className="pb-2 pr-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {safeTransactions.slice(0, maxItems).map((tx, index) => {
                const { isDeposit, sign, color, icon: TypeIcon, label: typeLabel } = getTxDirection(tx);
                const { label: statusLabel, color: statusColor, icon: StatusIcon } = getStatusDisplay(tx?.status);

                return (
                  <tr key={tx?._id || index} className="group hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 pl-4 rounded-l-2xl bg-slate-950/30">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDeposit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          <TypeIcon size={16} />
                        </div>
                        <span className="font-bold text-slate-200">{typeLabel}</span>
                      </div>
                    </td>
                    <td className="py-4 bg-slate-950/30 font-mono font-bold">
                      <span className={isDeposit ? 'text-emerald-400' : 'text-rose-400'}>
                        {sign}${Math.abs(Number(tx?.amount ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 text-xs hidden md:table-cell bg-slate-950/30">
                      {formatDate(tx?.createdAt || tx?.date)}
                    </td>
                    <td className="py-4 pr-4 text-right rounded-r-2xl bg-slate-950/30">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        statusColor === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        statusColor === 'rose' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        <StatusIcon size={12} /> {statusLabel}
                      </span>
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

