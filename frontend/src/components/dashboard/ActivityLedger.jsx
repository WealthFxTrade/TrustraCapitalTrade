import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Shield,
  Fingerprint
} from 'lucide-react';

const ActivityLedger = ({ transactions = [], loading }) => {
  
  // ── STATUS STYLING ENGINE ──
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'pending':
      case 'processing':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/5 animate-pulse';
      case 'rejected':
      case 'cancelled':
      case 'failed':
        return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
      default:
        return 'text-gray-500 border-white/10 bg-white/5';
    }
  };

  // ── TYPE ICON ENGINE ──
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
        return <ArrowDownLeft className="text-emerald-400" size={18} />;
      case 'withdrawal':
        return <ArrowUpRight className="text-rose-400" size={18} />;
      case 'roi_credit':
        return <Zap className="text-amber-400" size={18} />;
      default:
        return <Fingerprint className="text-blue-400" size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-[2rem]" />
        ))}
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-20 text-center">
        <div className="inline-flex p-4 bg-white/5 rounded-full mb-4">
          <Shield className="text-gray-700" size={32} />
        </div>
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] italic">
          No Protocol Activity Detected
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ledger Header */}
      <header className="flex justify-between items-end mb-8 px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500/60 mb-1">
            <Clock size={12} />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Institutional Audit Log</span>
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white">
            Protocol <span className="text-emerald-500">Ledger</span>
          </h3>
        </div>
        <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest hidden md:block">
          Node Sync: <span className="text-emerald-500">Stable</span>
        </div>
      </header>

      {/* Transaction List */}
      <div className="divide-y divide-white/5 bg-[#06080c] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        {transactions.map((tx, idx) => (
          <div 
            key={tx._id || idx} 
            className="group px-8 py-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.02] transition-all relative overflow-hidden"
          >
            {/* Hover Accent */}
            <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-6 flex-1">
              {/* Type Icon Box */}
              <div className="p-4 bg-black/40 border border-white/10 rounded-2xl group-hover:border-emerald-500/30 transition-colors shadow-inner">
                {getTypeIcon(tx.type)}
              </div>

              <div>
                <p className="text-white font-black uppercase tracking-widest text-sm italic flex items-center gap-2">
                  {tx.type?.replace('_', ' ') || 'Protocol Execution'}
                  <span className="text-[10px] text-gray-600 font-mono normal-case tracking-normal not-italic opacity-50">
                    #{ (tx._id || '0000').slice(-6).toUpperCase() }
                  </span>
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-tighter italic">
                    {new Date(tx.createdAt).toLocaleDateString('de-DE')} • {new Date(tx.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <span className="w-1 h-1 bg-gray-800 rounded-full" />
                  <p className="text-[10px] text-gray-600 font-mono truncate max-w-[150px] md:max-w-xs uppercase">
                    {tx.description || `Network settlement via ${tx.currency || 'EUR'}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center mt-6 md:mt-0 gap-4">
              <div className="text-right">
                <p className={`font-mono text-lg font-black italic tracking-tighter ${
                  tx.type === 'withdrawal' ? 'text-rose-500' : 'text-emerald-500'
                }`}>
                  {tx.type === 'withdrawal' ? '-' : '+'}
                  {Number(tx.amount || 0).toLocaleString('de-DE', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                  <span className="ml-2 text-[10px] opacity-60 uppercase font-black">{tx.currency || 'EUR'}</span>
                </p>
              </div>

              {tx.status && (
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border flex items-center gap-2 ${getStatusStyles(tx.status)}`}>
                  {tx.status === 'completed' && <CheckCircle2 size={10} />}
                  {tx.status === 'pending' && <Clock size={10} />}
                  {tx.status === 'rejected' && <XCircle size={10} />}
                  {tx.status.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <footer className="px-8 py-2">
        <p className="text-[8px] text-gray-700 font-black uppercase tracking-[0.5em] text-center italic">
          Transactions are cryptographically verified by the Trustra Liquidity Engine
        </p>
      </footer>
    </div>
  );
};

export default ActivityLedger;
