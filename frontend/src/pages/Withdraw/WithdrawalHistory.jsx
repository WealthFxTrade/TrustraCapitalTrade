import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, ArrowLeftRight } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function WithdrawalHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/withdraw/my');
      setHistory(data.withdrawals);
    } catch (err) {
      toast.error("Cloud Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Retract this extraction request? Funds will be restored to your ROI wallet.")) return;
    
    try {
      await api.patch(`/withdraw/cancel/${id}`);
      toast.success("Extraction retracted successfully.");
      fetchHistory(); // Refresh to show 'cancelled' status
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol Error");
    }
  };

  if (loading) return <div className="p-10 animate-pulse text-[10px] font-black uppercase tracking-widest text-gray-500">Syncing Ledger...</div>;

  return (
    <div className="bg-[#05070a] border border-white/5 rounded-[2.5rem] p-8 mt-10">
      <div className="flex items-center gap-3 mb-8">
        <ArrowLeftRight size={20} className="text-yellow-500" />
        <h3 className="text-sm font-black uppercase tracking-widest">Extraction History</h3>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <p className="text-[11px] text-gray-600 italic">No historical extractions found in this node.</p>
        ) : (
          history.map((tx) => (
            <div key={tx._id} className="group flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all">
              <div className="flex items-center gap-4">
                <StatusIcon status={tx.status} />
                <div>
                  <p className="text-xs font-black uppercase tracking-tighter text-white">
                    €{tx.amount.toLocaleString()} <span className="text-gray-500 font-mono ml-2">({tx.currency})</span>
                  </p>
                  <p className="text-[9px] text-gray-600 font-mono mt-1 truncate w-32 md:w-full">
                    To: {tx.address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-[9px] font-black uppercase tracking-widest ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </span>
                
                {tx.status === 'pending' && (
                  <button 
                    onClick={() => handleCancel(tx._id)}
                    className="px-3 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[8px] font-black uppercase rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }) {
  if (status === 'pending') return <Clock size={16} className="text-yellow-500 animate-spin-slow" />;
  if (status === 'completed') return <CheckCircle2 size={16} className="text-emerald-500" />;
  return <XCircle size={16} className="text-red-500" />;
}

function getStatusColor(status) {
  switch (status) {
    case 'pending': return 'text-yellow-500';
    case 'completed': return 'text-emerald-500';
    case 'cancelled': return 'text-gray-500';
    default: return 'text-red-500';
  }
}
