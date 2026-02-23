import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get('/admin/withdrawals/pending');
      setRequests(res.data.withdrawals || []);
    } catch (err) {
      toast.error("Failed to sync Payout Ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (id, action) => {
    setProcessingId(id);
    try {
      await api.post(`/admin/withdrawals/${action}`, { withdrawalId: id });
      toast.success(`Protocol ${action.toUpperCase()} Executed`, {
        style: { background: '#0f172a', color: '#fff' }
      });
      fetchWithdrawals(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Execution Error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 lg:p-10 bg-[#05070a] min-h-screen text-white">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-red-500">
            <ShieldCheck size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Audit Level: High</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Payout <span className="text-slate-800">/</span> Management</h1>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Search User ID..." 
              className="bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs focus:border-red-500 outline-none transition"
            />
          </div>
          <button className="bg-white/5 border border-white/5 p-2 rounded-xl text-slate-400 hover:text-white">
            <Filter size={18} />
          </button>
        </div>
      </header>

      {/* WITHDRAWAL TABLE */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Investor</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4 text-right">Volume</th>
                <th className="px-6 py-4">Endpoint / Address</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-600 animate-pulse font-bold">Scanning Mempool...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-600 font-bold uppercase text-xs tracking-widest">No Pending Liquidations</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{req.user?.fullName || 'Anonymous'}</span>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">{req.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {req.method === 'crypto' ? <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg"><ArrowUpRight size={12}/></div> : <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg"><Clock size={12}/></div>}
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{req.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-black text-red-400 font-mono">€{req.amount.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase">{req.currency || 'EUR'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-500 truncate max-w-[180px]">{req.walletAddress || req.bankDetails}</span>
                        <button onClick={() => navigator.clipboard.writeText(req.walletAddress)} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink size={12} /></button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleAction(req._id, 'approve')}
                          disabled={processingId === req._id}
                          className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleAction(req._id, 'reject')}
                          disabled={processingId === req._id}
                          className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

