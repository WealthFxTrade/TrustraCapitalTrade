import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  Check,
  X,
  Clock,
  RefreshCw,
  Search,
  AlertTriangle,
} from 'lucide-react';
import {
  adminGetWithdrawals,
  adminApproveWithdrawal,
  adminRejectWithdrawal,
} from '../api/withdrawalApi';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../constants/api'; // ← centralized

export default function AdminWithdrawals() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadRequests = async () => {
    try {
      setLoading(true);
      // Use centralized endpoint if defined
      const endpoint = API_ENDPOINTS.ADMIN_WITHDRAWALS || '/admin/withdrawals/pending';
      const res = await adminGetWithdrawals(); // assuming this uses endpoint
      const data = res.data?.success ? res.data.withdrawals : (res.withdrawals || res.data || []);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Withdrawal queue error:', err);
      toast.error('Failed to load payout queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (id, action) => {
    const confirmMsg = `CONFIRM: ${action.toUpperCase()} this withdrawal request? This cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (action === 'approve') {
        await adminApproveWithdrawal(id);
        toast.success('Withdrawal approved');
      } else {
        await adminRejectWithdrawal(id);
        toast.success('Withdrawal rejected');
      }
      loadRequests(); // refresh
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    }
  };

  const filtered = requests.filter(req =>
    req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.btcAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 md:p-10 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-3 bg-slate-900 rounded-2xl border border-white/5 hover:bg-slate-800 transition active:scale-95 shadow-xl"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">Withdrawal Queue</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">
                Admin Review Required
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input
                type="text"
                placeholder="Search email / address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-900/30 border border-red-500/50 rounded-3xl p-6 mb-8 flex items-start gap-4">
          <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-bold text-red-300 mb-2">Admin Responsibility</h4>
            <p className="text-red-200 text-sm">
              Only approve legitimate requests. Unauthorized or suspicious withdrawals must be rejected. All actions are logged.
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/20 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                <tr>
                  <th className="px-8 py-6">Investor</th>
                  <th className="px-8 py-6">Amount</th>
                  <th className="px-8 py-6">Destination</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-32 text-center">
                      <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-4" />
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        Loading Secure Queue...
                      </p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-32 text-center">
                      <Clock className="h-8 w-8 text-slate-800 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                        No Pending Withdrawals
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((req) => (
                    <tr key={req._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-200">{req.user?.email || 'Unknown'}</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 flex items-center gap-2">
                          <Clock size={12} />
                          {new Date(req.createdAt).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-mono font-black text-amber-500 text-lg">
                          {Number(req.amount || 0).toLocaleString()} {req.currency || 'EUR'}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 font-mono text-[10px] text-indigo-400 break-all max-w-[200px]">
                            {req.walletAddress || 'N/A'}
                          </span>
                          {req.walletAddress && (
                            <a
                              href={`https://mempool.space/address/${req.walletAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-indigo-500/10 rounded-lg transition text-slate-600 hover:text-indigo-400"
                              title="Check on Blockchain"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleAction(req._id, 'reject')}
                            className="h-12 w-12 flex items-center justify-center bg-rose-500/5 text-rose-500 rounded-2xl border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                          >
                            <X size={20} />
                          </button>
                          <button
                            onClick={() => handleAction(req._id, 'approve')}
                            className="h-12 w-12 flex items-center justify-center bg-emerald-500/5 text-emerald-500 rounded-2xl border border-emerald-500/10 hover:bg-emerald-500 hover:text-white transition-all active:scale-90 shadow-lg shadow-emerald-500/10"
                          >
                            <Check size={20} />
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

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.6em] select-none">
            Secure Admin Vault • Logged & Audited
          </p>
        </div>
      </div>
    </div>
  );
}
