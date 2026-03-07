import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import { 
  Clock, CheckCircle2, XCircle, ExternalLink, 
  RefreshCw, AlertCircle, Banknote, Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function WithdrawalRequests() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/withdrawals');
      // Backend returns { success: true, count: X, data: [...] }
      setWithdrawals(data.data || []);
    } catch (err) {
      toast.error('Failed to sync withdrawal queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // Initial fetch
    const interval = setInterval(fetchWithdrawals, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, userId, status) => {
    setProcessingId(id);
    const toastId = toast.loading(`Marking transaction as ${status}...`);
    
    try {
      await api.patch(`/admin/withdrawal/${id}`, { status, userId });
      toast.success(`Transaction ${status}`, { id: toastId });
      fetchWithdrawals(); // Refresh the list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed', { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = useMemo(() => {
    return withdrawals.filter(w => 
      w.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [withdrawals, searchTerm]);

  if (loading && withdrawals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#020408] gap-4">
        <RefreshCw className="w-10 h-10 text-yellow-500 animate-spin" />
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em]">Syncing Payout Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#020408] min-h-screen text-white font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            PAYOUT <span className="text-yellow-500">PIPELINE</span>
          </h1>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-medium">
            Capital Outflow Management • Zurich Mainnet
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" placeholder="Filter by User/Status..."
              className="w-full bg-[#0A0C10] border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs focus:border-yellow-500/50 outline-none transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchWithdrawals} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── QUEUE TABLE ── */}
      <div className="bg-[#0A0C10] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              <tr>
                <th className="p-6">Timestamp</th>
                <th className="p-6">Investor Node</th>
                <th className="p-6">Amount</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Gatekeeper Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {filtered.map((w) => (
                <tr key={w._id} className={`hover:bg-white/[0.01] transition-colors ${w.status === 'pending' ? 'bg-yellow-500/[0.02]' : ''}`}>
                  <td className="p-6 text-gray-500">
                    {w.createdAt ? format(new Date(w.createdAt), 'MM/dd HH:mm') : '—'}
                  </td>
                  <td className="p-6">
                    <div className="text-white font-bold uppercase italic">{w.userName}</div>
                    <div className="text-[10px] text-gray-600 mt-0.5">{w.email}</div>
                  </td>
                  <td className="p-6 font-bold text-red-400">
                    {Math.abs(w.amount).toLocaleString()} {w.currency || 'EUR'}
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${
                      w.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                      w.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    {w.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          disabled={processingId === w._id}
                          onClick={() => handleAction(w._id, w.userId, 'approved')}
                          className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black rounded-lg transition-all border border-green-500/20"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button 
                          disabled={processingId === w._id}
                          onClick={() => handleAction(w._id, w.userId, 'rejected')}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-500/20"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-700 font-black tracking-widest uppercase">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4 opacity-50 grayscale">
              <Banknote className="w-12 h-12" />
              <p className="text-xs uppercase tracking-widest">Withdrawal pipeline is empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
