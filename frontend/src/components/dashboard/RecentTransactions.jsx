import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Activity
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
    if (diffMins < 2) return 'JUST NOW';
    if (diffMins < 60) return `${diffMins}M AGO`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}H AGO`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const getStatusDisplay = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (['completed', 'approved', 'success'].includes(s)) return { label: 'SUCCESS', color: 'emerald', icon: CheckCircle2 };
    if (['failed', 'rejected', 'cancelled', 'error'].includes(s)) return { label: 'FAILED', color: 'rose', icon: AlertCircle };
    return { label: 'PENDING', color: 'amber', icon: Clock };
  };

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  return (
    <section className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
            <Activity size={18} />
          </div>
          <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">Financial Ledger</h2>
        </div>
        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
          Syncing 2026 Archive
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : safeTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/10">
          <Activity className="h-12 w-12 mb-4 opacity-10 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">No transaction activity found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">
                <th className="pb-2 pl-6">Type</th>
                <th className="pb-2">Value</th>
                <th className="pb-2 hidden md:table-cell">Timestamp</th>
                <th className="pb-2 pr-6 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {safeTransactions.slice(0, maxItems).map((tx, index) => {
                const { isDeposit, sign, icon: TypeIcon, label: typeLabel } = getTxDirection(tx);
                const { label: statusLabel, color: statusColor, icon: StatusIcon } = getStatusDisplay(tx?.status);

                return (
                  <tr key={tx?._id || index} className="group transition-all duration-300">
                    <td className="py-5 pl-6 rounded-l-3xl bg-white/[0.02] border-y border-l border-white/5 group-hover:border-white/20 group-hover:bg-white/[0.04]">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${isDeposit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          <TypeIcon size={16} />
                        </div>
                        <span className="font-black text-white/80 uppercase tracking-widest text-[10px]">{typeLabel}</span>
                      </div>
                    </td>
                    <td className="py-5 bg-white/[0.02] border-y border-white/5 group-hover:border-white/20 group-hover:bg-white/[0.04] font-mono font-bold">
                      <span className={isDeposit ? 'text-emerald-400' : 'text-rose-400'}>
                        {sign}€{Math.abs(Number(tx?.amount ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-5 text-white/30 text-[10px] font-bold hidden md:table-cell bg-white/[0.02] border-y border-white/5 group-hover:border-white/20 group-hover:bg-white/[0.04]">
                      {formatDate(tx?.createdAt || tx?.date)}
                    </td>
                    <td className="py-5 pr-6 text-right rounded-r-3xl bg-white/[0.02] border-y border-r border-white/5 group-hover:border-white/20 group-hover:bg-white/[0.04]">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                        statusColor === 'emerald' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                        statusColor === 'rose' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' :
                        'bg-yellow-500/5 border-yellow-500/20 text-yellow-500'
                      }`}>
                        <StatusIcon size={10} /> {statusLabel}
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

