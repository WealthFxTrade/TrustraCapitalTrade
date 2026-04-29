// src/pages/Admin/WithdrawalRequestsTable.jsx
import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Search,
  RefreshCw,
  Wallet,
  AlertTriangle
} from 'lucide-react';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

export default function WithdrawalRequestsTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      // Points to: /admin/withdrawals
      const { data } = await api.get(API_ENDPOINTS.ADMIN.WITHDRAWALS);
      setRequests(data.withdrawals || data.data || []);
    } catch (err) {
      toast.error("Redemption Queue: Failed to sync with ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (id, action) => {
    const confirmMessage = `Confirm manual ${action} for redemption ID #${id.slice(-6).toUpperCase()}?`;
    if (!window.confirm(confirmMessage)) return;

    setProcessingId(id);
    const toastId = toast.loading(`Executing Outbound Protocol: ${action.toUpperCase()}...`);

    try {
      // Standardized with your controller logic
      const endpoint = action === 'approve'
        ? API_ENDPOINTS.ADMIN.APPROVE_WITHDRAWAL(id)
        : API_ENDPOINTS.ADMIN.REJECT_WITHDRAWAL(id);

      await api.put(endpoint);

      toast.success(`Liquidity Outbound: ${action.toUpperCase()} Successful`, { id: toastId });
      fetchWithdrawals();
    } catch (err) {
      toast.error(`Protocol Error: Manual override required for ${action}`, { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter(r =>
    r.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r._id?.includes(searchTerm) ||
    r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6 px-2">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Outbound <span className="text-rose-500 underline underline-offset-8 decoration-rose-500/20">Queue</span>
          </h2>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-3">
            Pending Capital Redemptions • Total: {requests.filter(r => r.status === 'pending').length}
          </p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-rose-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search TXID / Investor Name..."
              className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl py-4 pl-12 text-[10px] text-white focus:border-rose-500/40 outline-none uppercase font-black tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={fetchWithdrawals}
            className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-rose-500 hover:text-white transition-all group"
          >
            <RefreshCw size={20} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-[#06080c] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 italic">
                <th className="px-10 py-8">Request ID / Time</th>
                <th className="px-10 py-8">Investor Node</th>
                <th className="px-10 py-8">Value (EUR)</th>
                <th className="px-10 py-8">Method / Address</th>
                <th className="px-10 py-8 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-40 text-center animate-pulse text-[10px] font-black text-rose-500/40 uppercase tracking-[0.5em]">
                    Scanning Redemption Protocol...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-40 text-center text-[10px] font-black text-gray-800 uppercase tracking-[0.4em]">
                    Queue Optimized: No Pending Outbound Requests
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-white/[0.01] transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                          <Clock size={12} className="text-rose-500/50" />
                          {new Date(r.createdAt).toLocaleString()}
                        </span>
                        <code className="text-[9px] text-gray-700 font-mono">#{r._id.slice(-12).toUpperCase()}</code>
                      </div>
                    </td>

                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white italic uppercase">{r.user?.name || 'Unknown Participant'}</span>
                        <span className="text-[9px] text-gray-600 font-bold lowercase">{r.user?.email}</span>
                      </div>
                    </td>

                    <td className="px-10 py-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-lg font-black font-mono italic text-white">
                                €{Number(r.amount).toLocaleString('de-DE')}
                            </span>
                            {r.amount > 10000 && (
                                <span className="flex items-center gap-1.5 text-[8px] font-black text-rose-500 uppercase animate-pulse">
                                    <AlertTriangle size={10} /> High Value Node
                                </span>
                            )}
                        </div>
                    </td>

                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/5 self-start px-2 py-0.5 rounded border border-emerald-500/10">
                          {r.asset || r.method || 'SEPA/BANK'}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono truncate w-64" title={r.address}>
                          {r.address || 'Standard SEPA Linked Account'}
                        </span>
                      </div>
                    </td>

                    <td className="px-10 py-8 text-right">
                      {r.status === 'pending' ? (
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button
                            onClick={() => handleAction(r._id, 'reject')}
                            disabled={processingId === r._id}
                            className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30"
                          >
                            <XCircle size={20} />
                          </button>
                          <button
                            onClick={() => handleAction(r._id, 'approve')}
                            disabled={processingId === r._id}
                            className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-30"
                          >
                            <CheckCircle2 size={20} />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${
                          r.status === 'approved' 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' 
                            : 'bg-rose-500/5 border-rose-500/20 text-rose-500'
                        }`}>
                          {r.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECURITY FOOTER ── */}
      <div className="flex items-center gap-4 p-8 bg-white/5 border border-white/5 rounded-[2.5rem]">
        <ShieldAlert className="text-rose-500" size={24} />
        <div>
          <p className="text-[10px] font-black text-white uppercase tracking-widest">Manual Liquidity Protocol</p>
          <p className="text-[9px] text-gray-600 uppercase font-bold mt-1">
            Always verify the destination node address before authorizing outbound capital transfers.
          </p>
        </div>
      </div>
    </div>
  );
}

