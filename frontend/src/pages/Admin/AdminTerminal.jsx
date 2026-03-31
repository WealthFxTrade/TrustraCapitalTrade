import React, { useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from '../../constants/api';
import { 
  ShieldCheck, 
  Users, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Activity, 
  Check, 
  X, 
  Loader2, 
  Search,
  Zap,
  Lock,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminTerminal() {
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deposits'); // 'deposits' | 'withdrawals' | 'users'

  // ── DATA SYNC ──
  const fetchQueue = async () => {
    setLoading(true);
    try {
      const [depRes, withRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN.DEPOSITS),
        api.get(API_ENDPOINTS.ADMIN.WITHDRAWALS)
      ]);
      setPendingDeposits(depRes.data.filter(d => d.status === 'pending') || []);
      setPendingWithdrawals(withRes.data.filter(w => w.status === 'pending') || []);
    } catch (err) {
      toast.error("Security Sync Failure: Unauthorized Access");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  // ── ACTION HANDLERS ──
  const handleAction = async (type, id, action) => {
    const toastId = toast.loading(`Broadcasting ${action.toUpperCase()} Signal...`);
    try {
      const endpoint = type === 'deposit' 
        ? (action === 'approve' ? API_ENDPOINTS.ADMIN.APPROVE_DEPOSIT(id) : API_ENDPOINTS.ADMIN.REJECT_DEPOSIT(id))
        : (action === 'approve' ? API_ENDPOINTS.ADMIN.APPROVE_WITHDRAWAL(id) : API_ENDPOINTS.ADMIN.REJECT_WITHDRAWAL(id));

      await api.post(endpoint);
      toast.success(`Protocol ${action === 'approve' ? 'Confirmed' : 'Rejected'}`, { id: toastId });
      fetchQueue(); // Refresh the ledger queue
    } catch (err) {
      toast.error("Action Interrupted: Ledger Mismatch", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 font-sans selection:bg-emerald-500/30">
      
      {/* ── ADMIN HEADER ── */}
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <Lock size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">System Administrator Terminal</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">Root <span className="text-emerald-500">Access</span></h1>
        </div>

        <div className="flex bg-[#0a0c10] border border-white/5 p-2 rounded-[2rem] gap-2">
          <TabBtn active={activeTab === 'deposits'} onClick={() => setActiveTab('deposits')} icon={<ArrowDownCircle size={16}/>} label="Deposits" count={pendingDeposits.length} />
          <TabBtn active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} icon={<ArrowUpCircle size={16}/>} label="Withdrawals" count={pendingWithdrawals.length} />
          <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={16}/>} label="Network Users" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 border border-white/5 rounded-[3rem] bg-[#0a0c10]">
            <Loader2 className="animate-spin text-emerald-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">Decrypting Command Queue...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* ── QUEUE TABLE ── */}
            <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-widest">User / Entity</th>
                    <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-widest">Magnitude</th>
                    <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-widest">Reference / Destination</th>
                    <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(activeTab === 'deposits' ? pendingDeposits : pendingWithdrawals).map((req) => (
                    <tr key={req._id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-10 py-8">
                        <p className="text-sm font-black text-white italic uppercase tracking-tight">{req.user?.name || 'Unknown Node'}</p>
                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">{req.user?.email}</p>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-sm font-mono font-black text-emerald-500">
                          {activeTab === 'deposits' ? '+' : '-'}€{req.amount.toLocaleString()}
                        </p>
                        <p className="text-[9px] text-gray-700 font-bold uppercase tracking-tighter mt-1">{req.method || 'SEPA'}</p>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2 group/hash">
                          <code className="text-[10px] text-gray-500 font-mono break-all line-clamp-1">{req.destination || 'BANK_WIRE_REF'}</code>
                          <Zap size={10} className="text-emerald-500 opacity-0 group-hover/hash:opacity-100 transition-opacity" />
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => handleAction(activeTab === 'deposits' ? 'deposit' : 'withdrawal', req._id, 'reject')}
                            className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                          >
                            <X size={18} />
                          </button>
                          <button 
                            onClick={() => handleAction(activeTab === 'deposits' ? 'deposit' : 'withdrawal', req._id, 'approve')}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                          >
                            <Check size={16} /> Confirm
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(activeTab === 'deposits' ? pendingDeposits : pendingWithdrawals).length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-24 text-center">
                        <Activity className="mx-auto text-gray-800 mb-4" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">All command queues cleared. System Nominal.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 text-center opacity-20">
        <p className="text-[9px] font-black uppercase tracking-[1em]">Secure Environment • AES-256 Multi-Layer Auth</p>
      </footer>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, count }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-emerald-600 text-black shadow-xl shadow-emerald-500/20' : 'text-gray-500 hover:bg-white/5'
      }`}
    >
      {icon} {label}
      {count > 0 && <span className={`ml-2 px-2 py-0.5 rounded-full text-[8px] ${active ? 'bg-black text-emerald-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{count}</span>}
    </button>
  );
}
