import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Loader2, 
  ShieldCheck, 
  ArrowUpRight,
  Wallet,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/api';
import AdminTable from '../../components/admin/AdminTable';

export default function AdminWithdrawals() {
  const [processingId, setProcessingId] = useState(null);

  // Status Styling Utility
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      case 'rejected': return { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
      default: return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    }
  };

  const processWithdrawal = async (id, status) => {
    setProcessingId(id);
    const actionLabel = status === 'completed' ? 'Authorize' : 'Decline';
    
    if (!window.confirm(`${actionLabel} this redemption request?`)) {
      setProcessingId(null);
      return;
    }

    const toastId = toast.loading(`${actionLabel}ing outbound liquidity...`);

    try {
      // Endpoint aligned with backend: /admin/withdrawal/:id
      await api.patch(`/admin/withdrawal/${id}`, { status });
      toast.success(`Redemption ${status} successfully`, { id: toastId });
      // Table will auto-refresh if AdminTable uses a refresh trigger
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authorization protocol failed', { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const renderRow = (w) => {
    const config = getStatusConfig(w.status);
    
    return (
      <div key={w._id} className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all group">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Identity & Asset Value */}
          <div className="flex items-start gap-6">
            <div className={`p-5 rounded-2xl border ${config.border} ${config.bg}`}>
              {w.status === 'pending' ? <Clock size={28} className={`${config.color} animate-pulse`} /> : 
               w.status === 'completed' ? <CheckCircle2 size={28} className={config.color} /> : 
               <XCircle size={28} className={config.color} />}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white text-xl uppercase tracking-tight">
                  {w.username || 'Client Node'}
                </span>
                <span className="text-[10px] bg-white/5 px-3 py-1 rounded-lg font-bold text-gray-600 uppercase tracking-widest">
                  Ref: {w._id?.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="text-3xl font-bold text-emerald-500 tracking-tighter">
                €{Number(w.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-gray-500 group-hover:text-emerald-500 transition-colors">
                <Wallet size={14} />
                <span className="cursor-pointer select-all" onClick={() => {
                  navigator.clipboard.writeText(w.address);
                  toast.success('Address copied');
                }}>
                  {w.address}
                </span>
                <ExternalLink size={12} className="opacity-30" />
              </div>
            </div>
          </div>

          {/* Authorization Actions */}
          <div className="flex items-center gap-3 lg:ml-auto">
            {w.status === 'pending' ? (
              <>
                <button
                  onClick={() => processWithdrawal(w._id, 'rejected')}
                  disabled={processingId === w._id}
                  className="px-8 py-4 border border-white/10 hover:border-red-500/50 hover:bg-red-500/5 text-gray-500 hover:text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => processWithdrawal(w._id, 'completed')}
                  disabled={processingId === w._id}
                  className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-emerald-900/20 transition-all disabled:opacity-50"
                >
                  Authorize Release
                </button>
              </>
            ) : (
              <div className={`px-10 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${config.border} ${config.bg} ${config.color}`}>
                {w.status}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-10 space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-emerald-500">
            <ArrowUpRight size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Liquidity Outbound Registry</span>
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-white">Capital <span className="text-emerald-500">Redemptions</span></h1>
        </div>
        <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
          <Globe size={14} /> Global Gateway Active
        </div>
      </header>

      <AdminTable
        fetchUrl="/admin/withdrawals"
        tableName="Redemptions"
        rowRenderer={renderRow}
      />
    </div>
  );
}

