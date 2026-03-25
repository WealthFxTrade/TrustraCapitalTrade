// src/pages/Admin/AdminWithdrawals.jsx - PROFESSIONAL WITHDRAWAL MANAGEMENT
import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchWithdrawals = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get('/api/admin/withdrawals');
      setWithdrawals(data.withdrawals || data.data || data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load withdrawal queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const processWithdrawal = async (id, status) => {
    setProcessingId(id);
    const confirmMsg = status === 'completed'
      ? 'Approve this withdrawal? Funds will be sent to the user.'
      : 'Reject this withdrawal? Funds will be refunded to user balance.';

    if (!window.confirm(confirmMsg)) {
      setProcessingId(null);
      return;
    }

    const toastId = toast.loading(status === 'completed' ? 'Approving payout...' : 'Rejecting withdrawal...');

    try {
      await api.patch(`/api/admin/withdrawal/${id}`, { status });
      toast.success(`Withdrawal ${status} successfully`, { id: toastId });
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process withdrawal', { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) =>
    w.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#020408] min-h-screen text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            WITHDRAWAL <span className="text-yellow-500">MANAGEMENT</span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em] font-black">
            Review and process pending payout requests
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search user, address or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 pl-11 py-3 rounded-2xl text-sm focus:border-yellow-500 outline-none"
            />
          </div>

          <button
            onClick={fetchWithdrawals}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-white/10 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            REFRESH QUEUE
          </button>
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="space-y-6">
        {loading && withdrawals.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem] p-20 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <p className="text-gray-400 font-black uppercase tracking-[0.4em]">No pending withdrawals</p>
          </div>
        ) : (
          filteredWithdrawals.map((w) => (
            <div
              key={w._id}
              className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] p-8 hover:border-yellow-500/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                  <div className={`p-5 rounded-2xl border ${getStatusBg(w.status)}`}>
                    <StatusIcon status={w.status} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-white text-xl uppercase tracking-tight">{w.username}</span>
                      <span className="text-xs bg-white/5 px-3 py-1 rounded-full font-mono text-gray-500">
                        ID: {w._id?.slice(-8).toUpperCase()}
                      </span>
                    </div>

                    <div className="text-3xl font-black text-white tracking-tighter">
                      €{Number(w.amount || 0).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                      Destination: 
                      <span 
                        className="text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors select-all"
                        onClick={() => navigator.clipboard.writeText(w.address)}
                      >
                        {w.address}
                      </span>
                      <ExternalLink size={14} className="opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 lg:ml-auto">
                  {w.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => processWithdrawal(w._id, 'rejected')}
                        disabled={processingId === w._id}
                        className="px-10 py-4 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                      >
                        REJECT
                      </button>
                      <button
                        onClick={() => processWithdrawal(w._id, 'completed')}
                        disabled={processingId === w._id}
                        className="px-12 py-4 bg-emerald-500 hover:bg-emerald-600 text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50"
                      >
                        APPROVE PAYOUT
                      </button>
                    </>
                  ) : (
                    <div className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border ${getStatusColor(w.status)} bg-white/5`}>
                      {w.status.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ── HELPERS ── */
function StatusIcon({ status }) {
  if (status === 'pending') return <Clock size={28} className="text-yellow-500 animate-pulse" />;
  if (status === 'completed') return <CheckCircle2 size={28} className="text-emerald-500" />;
  return <XCircle size={28} className="text-red-500" />;
}

function getStatusBg(status) {
  if (status === 'pending') return 'bg-yellow-500/10 border-yellow-500/30';
  if (status === 'completed') return 'bg-emerald-500/10 border-emerald-500/30';
  return 'bg-red-500/10 border-red-500/30';
}

function getStatusColor(status) {
  if (status === 'pending') return 'text-yellow-400 border-yellow-500/30';
  if (status === 'completed') return 'text-emerald-400 border-emerald-500/30';
  return 'text-red-400 border-red-500/30';
}
