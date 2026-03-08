// src/pages/Admin/AdminWithdrawals.jsx
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  ExternalLink, 
  ArrowUpRight 
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // ── DATA FETCHING ──
  const fetchWithdrawals = async () => {
    try {
      const { data } = await api.get('/admin/withdrawals');
      // Ensure we handle both potential response structures
      setWithdrawals(data.withdrawals || data || []);
    } catch (err) {
      toast.error("Failed to sync with withdrawal registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // ── ACTION HANDLERS ──
  const processAction = async (id, status) => {
    const confirmMsg = status === 'completed'
      ? "Confirm this extraction as successful?"
      : "Reject this extraction? Funds will be auto-refunded to user ROI.";

    if (!window.confirm(confirmMsg)) return;

    const loadId = toast.loading("Processing Protocol Update...");
    try {
      await api.patch(`/admin/withdrawal/${id}`, { status });
      toast.success(`Protocol updated: ${status}`, { id: loadId });
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Handshake failed during processing.", { id: loadId });
    }
  };

  // ── FILTERING LOGIC ──
  const filtered = withdrawals.filter(w =>
    w.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#020408]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500/40">Syncing Queue...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">Extraction <span className="text-yellow-500 not-italic">Oversight</span></h2>
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-[0.4em] mt-2">Zurich HQ / Withdrawal Registry</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
          <input
            type="text"
            placeholder="Search User or Wallet..."
            className="bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs text-white focus:border-yellow-500/50 outline-none w-full md:w-80 transition-all font-bold uppercase tracking-widest placeholder:text-gray-700"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main List */}
      <div className="grid gap-6">
        {filtered.length === 0 ? (
          <div className="text-center py-32 bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
            <p className="text-gray-700 font-black text-[10px] uppercase tracking-[0.5em] italic">No pending extractions in current node</p>
          </div>
        ) : (
          filtered.map((w) => (
            <div key={w._id} className="bg-[#05070a] border border-white/5 rounded-[2.5rem] p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:border-yellow-500/20 transition-all group">
              <div className="flex items-start gap-6">
                <div className={`p-4 rounded-2xl ${getStatusBg(w.status)} border border-white/5 shadow-inner`}>
                  <StatusIcon status={w.status} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-white uppercase italic tracking-tight">{w.username}</span>
                    <span className="text-[10px] text-gray-600 font-mono tracking-tighter bg-white/5 px-2 py-0.5 rounded">ID: {w._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-2xl font-black text-white tracking-tighter italic">€{w.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <div className="flex items-center gap-2 group/addr cursor-pointer">
                      <p className="text-[10px] text-gray-500 font-mono uppercase truncate max-w-[200px] md:max-w-none">
                        Dest: <span className="text-yellow-500/60 select-all group-hover/addr:text-yellow-500 transition-colors">{w.address}</span>
                      </p>
                      <ExternalLink size={12} className="text-gray-700 group-hover/addr:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex items-center gap-4">
                {w.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => processAction(w._id, 'rejected')}
                      className="px-8 py-4 bg-transparent hover:bg-red-500/10 text-red-500 text-[10px] font-black uppercase rounded-2xl transition-all border border-red-500/20 tracking-widest"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => processAction(w._id, 'completed')}
                      className="px-10 py-4 bg-emerald-500 text-black text-[10px] font-black uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-emerald-500/10 tracking-widest italic"
                    >
                      Approve
                    </button>
                  </>
                ) : (
                  <div className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] ${getStatusColor(w.status)} bg-white/[0.03] border border-white/5 italic`}>
                    {w.status}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── UI HELPERS ──
function StatusIcon({ status }) {
  if (status === 'pending') return <Clock size={22} className="text-yellow-500 animate-pulse" />;
  if (status === 'completed') return <CheckCircle2 size={22} className="text-emerald-500" />;
  return <XCircle size={22} className="text-red-500" />;
}

function getStatusBg(status) {
  if (status === 'pending') return 'bg-yellow-500/5';
  if (status === 'completed') return 'bg-emerald-500/5';
  return 'bg-red-500/5';
}

function getStatusColor(status) {
  if (status === 'pending') return 'text-yellow-500';
  if (status === 'completed') return 'text-emerald-500';
  return 'text-red-500';
}
