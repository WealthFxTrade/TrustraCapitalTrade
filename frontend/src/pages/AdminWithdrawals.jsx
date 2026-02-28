// src/pages/AdminWithdrawals.jsx - Production v8.4.1
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ArrowLeft, ExternalLink, Check, X, 
  Clock, RefreshCw, Search, AlertTriangle, Copy
} from 'lucide-react';
import { 
  adminGetWithdrawals, 
  adminApproveWithdrawal, 
  adminRejectWithdrawal 
} from '../api/withdrawalApi';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../constants/api';

export default function AdminWithdrawals() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadRequests = async () => {
    try {
      setLoading(true);
      // Logic supports your centralized API_ENDPOINTS or your custom API wrapper
      const res = await adminGetWithdrawals();
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
    const confirmMsg = `CONFIRM: ${action.toUpperCase()} this withdrawal? This is irreversible.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (action === 'approve') {
        await adminApproveWithdrawal(id);
        toast.success('Withdrawal Approved');
      } else {
        await adminRejectWithdrawal(id);
        toast.error('Withdrawal Rejected');
      }
      loadRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Address Copied', { position: 'bottom-center' });
  };

  const filtered = requests.filter(req =>
    req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans selection:bg-yellow-500/30">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/admin')}
              className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-90"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Withdrawal Queue</h1>
              <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mt-1">
                Manual Verification Required
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <input
              type="text"
              placeholder="Search email / address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs outline-none focus:border-yellow-500 transition-all"
            />
          </div>
        </div>

        {/* Responsibility Banner */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-6 flex items-start gap-5">
          <AlertTriangle className="text-red-500 shrink-0 mt-1" size={28} />
          <div>
            <h4 className="font-black text-red-500 uppercase text-xs mb-1">Administrative Liability</h4>
            <p className="text-red-200/50 text-[10px] uppercase font-bold leading-relaxed tracking-widest">
              Verify destination hashes before approval. Unauthorized payouts cannot be clawed back. 
              All session actions are recorded in the audit log.
            </p>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] overflow-hidden shadow-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
                  <th className="px-10 py-8">Investor Identity</th>
                  <th className="px-10 py-8">Capital</th>
                  <th className="px-10 py-8">Target Hash</th>
                  <th className="px-10 py-8 text-right">Protocol Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-32 text-center">
                      <RefreshCw className="h-10 w-10 text-yellow-500 animate-spin mx-auto mb-6" />
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">Synchronizing Ledger...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-32 text-center">
                      <Clock className="h-10 w-10 text-gray-800 mx-auto mb-6" />
                      <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">Queue Is Currently Clear</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((req) => (
                    <tr key={req._id} className="hover:bg-white/[0.01] transition-all group">
                      <td className="px-10 py-8">
                        <p className="text-sm font-black text-white">{req.user?.email || 'System Account'}</p>
                        <p className="text-[9px] text-gray-600 font-bold uppercase mt-1 flex items-center gap-2">
                          <Clock size={12} /> {new Date(req.createdAt).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-10 py-8">
                        <p className="font-black text-yellow-500 text-xl italic tracking-tighter">
                          €{Number(req.amount || 0).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                          <span className="bg-black/60 px-4 py-2 rounded-xl border border-white/5 font-mono text-[10px] text-yellow-500/70 break-all max-w-[200px]">
                            {req.walletAddress || 'N/A'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => copyToClipboard(req.walletAddress)}
                              className="p-2 hover:bg-white/5 rounded-lg transition text-gray-600 hover:text-white"
                              title="Copy Hash"
                            >
                              <Copy size={14} />
                            </button>
                            {req.walletAddress && (
                              <a
                                href={`https://mempool.space/address/${req.walletAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-white/5 rounded-lg transition text-gray-600 hover:text-white"
                                title="Verify on Blockchain"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleAction(req._id, 'reject')}
                            className="h-14 w-14 flex items-center justify-center bg-red-500/10 text-red-500 rounded-[1.25rem] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                          >
                            <X size={24} />
                          </button>
                          <button
                            onClick={() => handleAction(req._id, 'approve')}
                            className="h-14 w-14 flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-[1.25rem] border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/10"
                          >
                            <Check size={24} />
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

        {/* Security Footer */}
        <div className="text-center pb-10">
          <p className="text-[9px] font-black text-gray-800 uppercase tracking-[0.8em] select-none">
            Secure Node Operator Session • SHA-256 Verified
          </p>
        </div>
      </div>
    </div>
  );
}
