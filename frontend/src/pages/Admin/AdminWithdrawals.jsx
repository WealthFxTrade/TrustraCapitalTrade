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
      setWithdrawals(data.withdrawals);
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

    try {
      await api.patch(`/admin/withdrawal/${id}`, { status });
      toast.success(`Protocol updated: ${status}`);
      fetchWithdrawals(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Handshake failed during processing.");
    }
  };

  // ── FILTERING LOGIC ──
  const filtered = withdrawals.filter(w => 
    w.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Extraction Oversight</h2>
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mt-1">Zurich HQ / Withdrawal Registry</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
          <input 
            type="text"
            placeholder="Search User or Wallet..."
            className="bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-yellow-500/50 outline-none w-64 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main List */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
            <p className="text-gray-600 font-mono text-[10px] uppercase tracking-widest">No pending extractions in current node</p>
          </div>
        ) : (
          filtered.map((w) => (
            <div key={w._id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-white/10 transition-all group">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${getStatusBg(w.status)} transition-colors`}>
                  <StatusIcon status={w.status} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white uppercase tracking-tight">{w.username}</span>
                    <span className="text-[10px] text-gray-500 font-mono tracking-tighter italic">{w.email}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-lg font-black text-white tracking-tighter">€{w.amount.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] text-gray-500 font-mono uppercase truncate max-w-[150px] md:max-w-none">
                        Dest: <span className="text-yellow-500/80 select-all">{w.address}</span>
                      </p>
                      <ExternalLink size={10} className="text-gray-700 hover:text-white cursor-pointer transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex items-center gap-3">
                {w.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => processAction(w._id, 'rejected')}
                      className="px-6 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase rounded-xl transition-all border border-red-500/20"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => processAction(w._id, 'completed')}
                      className="px-6 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Approve
                    </button>
                  </>
                ) : (
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(w.status)} bg-white/[0.03] border border-white/5`}>
                    {w.status}
                  </span>
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
  if (status === 'pending') return <Clock size={18} className="text-yellow-500 animate-pulse" />;
  if (status === 'completed') return <CheckCircle2 size={18} className="text-emerald-500" />;
  return <XCircle size={18} className="text-red-500" />;
}

function getStatusBg(status) {
  if (status === 'pending') return 'bg-yellow-500/10';
  if (status === 'completed') return 'bg-emerald-500/10';
  return 'bg-red-500/10';
}

function getStatusColor(status) {
  if (status === 'pending') return 'text-yellow-500';
  if (status === 'completed') return 'text-emerald-500';
  return 'text-red-500';
}
