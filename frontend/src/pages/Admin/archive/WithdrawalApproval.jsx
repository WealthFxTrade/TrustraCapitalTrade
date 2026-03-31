import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { API_ENDPOINTS } from '../../constants/api';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Wallet, 
  ExternalLink, 
  Loader2, 
  ShieldAlert,
  ArrowDownRight,
  Search,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const WithdrawalApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('');

  /** ── 🛰️ FETCH PENDING QUEUE ── */
  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(API_ENDPOINTS.ADMIN.TRANSACTIONS);
      if (data.success) {
        // Filter only for 'withdrawal' types that are 'pending'
        const pending = data.data.filter(tx => tx.type === 'withdrawal' && tx.status === 'pending');
        setRequests(pending);
      }
    } catch (err) {
      toast.error("Failed to sync withdrawal queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  /** ── ⚖️ DECISION HANDLER ── */
  const handleDecision = async (transactionId, userId, action) => {
    if (!window.confirm(`Confirm ${action} for this transaction?`)) return;
    
    setProcessingId(transactionId);
    try {
      // Targets router.put('/admin/user/update/:id') to change transaction status in ledger
      const { data } = await api.put(`${API_ENDPOINTS.ADMIN.UPDATE_USER}/${userId}/transaction`, {
        transactionId,
        status: action === 'approve' ? 'completed' : 'rejected'
      });

      if (data.success) {
        toast.success(`Transaction ${action}ed successfully`);
        fetchQueue();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol Update Failed");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.address?.toLowerCase().includes(filter.toLowerCase()) || 
    r.currency?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <ShieldAlert size={20} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Liquidity Gateway Control</span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
              Payout <span className="text-red-500">Queue</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
             <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
                <Search size={14} className="text-white/20" />
                <input 
                  type="text" 
                  placeholder="Filter Address..." 
                  className="bg-transparent outline-none text-[10px] font-bold uppercase tracking-widest w-40"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
             </div>
             <button onClick={fetchQueue} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
             </button>
          </div>
        </div>

        {/* QUEUE TABLE */}
        <div className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6">Request ID / Date</th>
                <th className="px-8 py-6">Target Node (User)</th>
                <th className="px-8 py-6">Amount / Asset</th>
                <th className="px-8 py-6">Destination Address</th>
                <th className="px-8 py-6 text-right">Authorize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-500" /></td></tr>
              ) : filteredRequests.length > 0 ? filteredRequests.map((tx) => (
                <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-[10px] font-mono text-white/40 mb-1">#{tx._id.slice(-10).toUpperCase()}</p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter">
                      <Clock size={12} className="text-yellow-500" />
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-white uppercase italic">{tx.username || "Unknown Node"}</p>
                    <p className="text-[9px] text-white/20 font-mono tracking-widest uppercase">ID: {tx.userId?.slice(-6)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <ArrowDownRight className="text-red-500" size={16} />
                       <span className="text-xl font-black text-white italic">
                         {Math.abs(tx.amount).toFixed(tx.currency === 'EUR' ? 2 : 6)}
                       </span>
                       <span className="text-[10px] font-black text-white/30 uppercase">{tx.currency}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 group/addr">
                       <p className="text-[10px] font-mono text-white/40 break-all max-w-[150px] truncate">{tx.address}</p>
                       <ExternalLink size={12} className="text-white/10 group-hover/addr:text-indigo-400 cursor-pointer" />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleDecision(tx._id, tx.userId, 'approve')}
                        disabled={processingId === tx._id}
                        className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/5"
                      >
                        {processingId === tx._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      </button>
                      <button 
                        onClick={() => handleDecision(tx._id, tx.userId, 'reject')}
                        disabled={processingId === tx._id}
                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-white/10 text-xs font-black uppercase tracking-[0.5em]">
                    Liquidity Queue Empty // System Nominal
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalApproval;

