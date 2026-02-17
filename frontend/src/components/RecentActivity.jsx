import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  XCircle,
  History
} from 'lucide-react';

export default function RecentActivity({ transactions = [], loading }) {
  
  // Formatters
  const formatEUR = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
  const formatDate = (iso) => new Date(iso).toLocaleString('de-DE', { 
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
  });

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit': return <ArrowDownLeft className="text-emerald-500" size={16} />;
      case 'withdrawal': return <ArrowUpRight className="text-red-500" size={16} />;
      case 'trade': return <RefreshCw className="text-blue-500" size={16} />;
      default: return <Clock className="text-slate-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-emerald-500';
      case 'pending': return 'text-yellow-500 animate-pulse';
      case 'failed': return 'text-red-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-white/5 flex items-center justify-between">
        <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2">
          <History size={16} className="text-blue-500" /> System Ledger
        </h3>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Audit Trail</span>
      </div>

      <div className="p-6 overflow-y-auto max-h-[450px] no-scrollbar">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-slate-800 rounded" />
                    <div className="h-2 w-16 bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
              No Network Activity Logged
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {transactions.map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between group transition-all duration-300">
                <div className="flex items-center gap-4">
                  {/* Icon Wrapper */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl group-hover:border-slate-600 transition-colors">
                    {getIcon(tx.type)}
                  </div>
                  
                  {/* Info */}
                  <div>
                    <p className="text-white text-xs font-bold capitalize tracking-tight">
                      {tx.type}
                    </p>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-0.5">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Amount & Status */}
                <div className="text-right">
                  <p className={`text-sm font-black font-mono ${
                    tx.type.toLowerCase() === 'withdrawal' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {tx.type.toLowerCase() === 'withdrawal' ? '-' : '+'}
                    {tx.asset === 'EUR' ? formatEUR(tx.amount) : `${tx.amount} ${tx.asset}`}
                  </p>
                  <p className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto p-4 bg-slate-950/50 border-t border-slate-800 text-center">
        <p className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.3em]">
          End-to-End Encrypted Gateway
        </p>
      </div>
    </div>
  );
}

