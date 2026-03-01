import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  Clock, CheckCircle2, XCircle, ExternalLink, 
  ArrowUpRight, AlertCircle, Loader2, Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WithdrawalRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchWithdrawals = async () => {
    try {
      const { data } = await api.get('/admin/withdrawals');
      setRequests(data);
    } catch (err) {
      toast.error("Audit Sync Failed: Withdrawal Ledger Unreachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const confirmMsg = status === 'approved' 
      ? "Confirm: Have you manually processed this payout to the external wallet?" 
      : "Confirm: Are you rejecting this withdrawal request?";
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.put(`/admin/withdrawals/${id}`, { status });
      toast.success(`Protocol: Request marked as ${status}`);
      fetchWithdrawals();
    } catch (err) {
      toast.error("Protocol Error: Status update failed");
    }
  };

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Filter Control */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <ArrowUpRight className="text-rose-500" /> Payout <span className="text-rose-500">Queue</span>
          </h1>
          <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mt-2">v8.4.2 Capital Exit Authorization</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-rose-600 text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Ledger */}
      <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] overflow-hidden">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-rose-500 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Scanning Blockchain Gateway...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-24 text-center">
             <CheckCircle2 size={40} className="mx-auto text-emerald-500/20 mb-4" />
             <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Queue Clear: All protocols synchronized.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                <tr>
                  <th className="px-8 py-6">Investor & Method</th>
                  <th className="px-8 py-6">Asset Value</th>
                  <th className="px-8 py-6">Destination Address</th>
                  <th className="px-8 py-6">Audit Status</th>
                  <th className="px-8 py-6 text-right">Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-xs font-black uppercase text-white">{req.user?.fullName || 'Entity Unknown'}</p>
                      <p className="text-[9px] text-gray-600 font-mono mt-1">{req.method || 'USDT-TRC20'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-rose-500">-{req.amount.toLocaleString()} {req.currency || 'EUR'}</p>
                      <p className="text-[9px] text-gray-600 font-bold mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 group/addr">
                        <code className="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded truncate max-w-[150px]">
                          {req.address}
                        </code>
                        <ExternalLink size={12} className="text-gray-600 group-hover/addr:text-rose-500 cursor-pointer" />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border flex items-center gap-2 w-fit ${
                        req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}>
                        <Clock size={10} /> {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {req.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(req._id, 'rejected')}
                            className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                            title="Reject Request"
                          >
                            <XCircle size={16} />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(req._id, 'approved')}
                            className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                            title="Approve & Mark Paid"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Footer */}
      <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center gap-4">
        <AlertCircle size={20} className="text-rose-500" />
        <p className="text-[10px] text-gray-500 uppercase font-black italic tracking-widest leading-relaxed">
          Operational Security: Verify the destination address on the block explorer before approving any outbound capital.
        </p>
      </div>
    </div>
  );
}
