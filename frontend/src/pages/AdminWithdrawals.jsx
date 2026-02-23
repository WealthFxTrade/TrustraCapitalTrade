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
  Search 
} from 'lucide-react';
import { 
  adminGetWithdrawals, 
  adminApproveWithdrawal, 
  adminRejectWithdrawal 
} from '../api/withdrawalApi';
import toast from 'react-hot-toast';

export default function AdminWithdrawals() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. LOAD PENDING PAYOUTS
  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await adminGetWithdrawals();
      // Handle different API response structures (Axios data vs direct)
      const data = res.data?.success ? res.data.withdrawals : (res.withdrawals || res.data || []);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Vault Access Error:', err);
      toast.error('Unauthorized access to payout vault');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // 2. HANDLE APPROVE / REJECT
  const handleAction = async (id, action) => {
    // 2026 Security Standard: Manual Confirmation
    const confirmMessage = `CONFIRM: Are you sure you want to ${action.toUpperCase()} this payout?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      if (action === 'approve') {
        await adminApproveWithdrawal(id);
        toast.success('Transaction Broadcasted');
      } else {
        await adminRejectWithdrawal(id);
        toast.error('Transaction Rejected & Funds Refunded');
      }
      loadRequests(); // Refresh the ledger immediately
    } catch (err) {
      toast.error(err.response?.data?.message || `Action failed: ${action}`);
    }
  };

  // Filter logic for search bar
  const filteredRequests = requests.filter(req => 
    req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.btcAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 md:p-10 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin')}
              className="p-3 bg-slate-900 rounded-2xl border border-white/5 hover:bg-slate-800 transition active:scale-95 shadow-xl"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">Payout Vault</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Authorization Queue</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                type="text" 
                placeholder="Search Email / Address..." 
                className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs outline-none focus:border-indigo-500 transition"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-4 py-3 rounded-xl border border-indigo-500/20">
              <ShieldCheck size={14} /> Multi-Sig Active
            </div>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/20 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                <tr>
                  <th className="px-8 py-6">Investor Node</th>
                  <th className="px-8 py-6">Asset Value</th>
                  <th className="px-8 py-6">Destination Node</th>
                  <th className="px-8 py-6 text-right">Auth Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-32 text-center">
                      <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-4" />
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Accessing Secure Ledger...</p>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-32 text-center">
                      <Clock className="h-8 w-8 text-slate-800 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Queue Clear: No Pending Payouts</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-200">{req.user?.email || 'N/A'}</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 flex items-center gap-2">
                           <Clock size={12}/> {new Date(req.createdAt).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-mono font-black text-amber-500 text-lg">
                          {Number(req.amountSat || 0).toLocaleString()} <span className="text-[10px] opacity-70">sats</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                          Settlement: €{(req.amountEur || 0).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 font-mono text-[10px] text-indigo-400">
                            {req.btcAddress?.substring(0, 14)}...
                          </span>
                          <a 
                            href={`https://mempool.space{req.btcAddress}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-indigo-500/10 rounded-lg transition text-slate-600 hover:text-indigo-400"
                            title="Verify on Blockchain"
                          >
                            <ExternalLink size={14} />
                          </a>
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

        {/* FOOTER AUDIT */}
        <div className="mt-12 text-center">
          <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.6em] select-none">
            Trustra Institutional Vault • Node.01.Pvt
          </p>
        </div>
      </div>
    </div>
  );
}

