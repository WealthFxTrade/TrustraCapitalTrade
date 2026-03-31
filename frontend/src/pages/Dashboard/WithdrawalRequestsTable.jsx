import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Wallet, 
  Search, 
  RefreshCw,
  ShieldAlert,
  Loader2,
  ExternalLink
} from 'lucide-react';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

export default function WithdrawalRequestsTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      // Using the dynamic endpoint from our constants
      const { data } = await api.get(API_ENDPOINTS.ADMIN.WITHDRAWALS);
      setRequests(data.data || []);
    } catch (err) {
      toast.error("Treasury Sync Failed. Check Admin Permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleProcess = async (id, action) => {
    // Prevent double clicking
    if (processingId) return;
    
    setProcessingId(id);
    const toastId = toast.loading(`Authorizing ${action.toUpperCase()}...`);

    try {
      const endpoint = action === 'approve' 
        ? API_ENDPOINTS.ADMIN.APPROVE_WITHDRAWAL(id) 
        : API_ENDPOINTS.ADMIN.REJECT_WITHDRAWAL(id);

      await api.patch(endpoint);
      
      toast.success(`Transaction ${action.toUpperCase()} successfully`, { id: toastId });
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol level rejection.", { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* ── HEADER & SEARCH ── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <ShieldAlert size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">High-Value Authorization Queue</span>
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Capital <span className="text-emerald-500 underline underline-offset-8 decoration-emerald-500/20">Redemptions</span>
          </h2>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Filter by Email/Wallet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0a0c10] border border-white/5 rounded-2xl py-4 px-12 text-xs text-white w-full md:w-80 focus:border-emerald-500/40 outline-none transition-all placeholder:text-gray-700"
            />
            <Search className="absolute left-4 top-4 text-gray-700 group-focus-within:text-emerald-500 transition-colors" size={16} />
          </div>
          <button 
            onClick={fetchWithdrawals} 
            disabled={loading}
            className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── MAIN LEDGER ── */}
      <div className="bg-[#06080c] border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
                <th className="px-10 py-8">Investor Node</th>
                <th className="px-10 py-8">Redemption Value</th>
                <th className="px-10 py-8">Network Destination</th>
                <th className="px-10 py-8">Maturity Date</th>
                <th className="px-10 py-8 text-right">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-40 text-center">
                    <Loader2 className="animate-spin text-emerald-500 mx-auto mb-4" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500/40">Syncing Treasury...</p>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-40 text-center text-[10px] font-black uppercase tracking-[0.5em] text-gray-800 italic">
                    All Redemptions Settled
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-white/[0.01] transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white italic">{req.user?.name || req.user?.fullName}</span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">{req.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-rose-500 font-mono text-lg font-black italic">
                          <ArrowUpRight size={16} />
                          €{Number(req.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[9px] font-black text-gray-700 uppercase tracking-tighter mt-1">
                          Source: <span className="text-emerald-500/60">{req.walletType || 'General EUR'}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <code className="text-[10px] text-gray-500 bg-black/60 px-4 py-2 rounded-xl border border-white/5 font-mono max-w-[180px] truncate">
                            {req.address || req.walletAddress}
                          </code>
                          <span className="text-[8px] font-black text-gray-800 uppercase ml-2 tracking-widest italic">External Wallet Address</span>
                        </div>
                        <ExternalLink size={12} className="text-gray-800 hover:text-emerald-500 cursor-pointer transition-colors" />
                      </div>
                    </td>
                    <td className="px-10 py-8 text-gray-500 text-[10px] font-black uppercase tracking-tighter">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-amber-500/50" />
                        {new Date(req.createdAt).toLocaleDateString('de-DE')} 
                        <span className="text-gray-800 italic">@ {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleProcess(req._id, 'reject')}
                          disabled={processingId === req._id}
                          className="flex items-center gap-2 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-black px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-rose-500/10 active:scale-95 disabled:opacity-20"
                        >
                          Reject <XCircle size={14} />
                        </button>
                        <button
                          onClick={() => handleProcess(req._id, 'approve')}
                          disabled={processingId === req._id}
                          className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-emerald-500/20 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.1)] disabled:opacity-20"
                        >
                          Settle <CheckCircle size={14} />
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

      <div className="text-center">
        <p className="text-[9px] text-gray-800 uppercase font-black tracking-[0.8em] italic">
          Trustra Liquidity Engine • End-to-End Encryption Enabled
        </p>
      </div>
    </div>
  );
}
