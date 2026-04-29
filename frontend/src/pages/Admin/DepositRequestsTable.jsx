// src/pages/Admin/DepositRequestsTable.jsx
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Eye, 
  RefreshCcw, Loader2, ArrowDownLeft, ExternalLink 
} from 'lucide-react';
import api from '../../constants/api';
import toast from 'react-hot-toast';

export default function DepositRequestsTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchDeposits = async () => {
    try {
      const res = await api.get('/admin/deposits/pending');
      setRequests(res.data?.deposits || []);
    } catch (err) {
      toast.error('Failed to sync deposit ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeposits(); }, []);

  const handleAction = async (id, status) => {
    if (!window.confirm(`Confirm ${status} for this transaction?`)) return;
    
    setProcessingId(id);
    try {
      const res = await api.put(`/admin/deposits/${id}/status`, { status });
      if (res.data?.success) {
        toast.success(`Deposit ${status}`);
        fetchDeposits();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
      <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest text-center">
        Interrogating Inbound Streams...
      </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-6 lg:p-10">
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 text-emerald-500 mb-2 font-black uppercase tracking-widest text-[10px]">
            <ArrowDownLeft size={16} /> Asset Injection
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Deposit Queue</h1>
        </div>
        <button 
          onClick={fetchDeposits}
          className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all"
        >
          <RefreshCcw size={20} />
        </button>
      </header>

      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">User / Node</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Proof</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Timestamp</th>
              <th className="px-8 py-5 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests.map((req) => (
              <tr key={req._id} className="group hover:bg-white/[0.02] transition-all">
                <td className="px-8 py-6">
                  <p className="font-bold text-white">{req.user?.name || 'Unknown'}</p>
                  <p className="text-[10px] text-gray-500 font-mono italic">{req.user?.email}</p>
                </td>
                <td className="px-6 py-6 font-mono font-black text-emerald-400 text-lg">
                  €{Number(req.amount).toLocaleString('de-DE')}
                </td>
                <td className="px-6 py-6">
                  {req.proofUrl ? (
                    <button 
                      onClick={() => window.open(req.proofUrl, '_blank')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all text-[10px] font-black uppercase"
                    >
                      <ExternalLink size={12} /> View File
                    </button>
                  ) : (
                    <span className="text-gray-700 text-[10px] uppercase font-black tracking-widest">No Proof</span>
                  )}
                </td>
                <td className="px-6 py-6 text-[10px] text-gray-500 font-mono uppercase">
                  {new Date(req.createdAt).toLocaleString()}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => handleAction(req._id, 'rejected')}
                      disabled={processingId === req._id}
                      className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      <XCircle size={20} />
                    </button>
                    <button 
                      onClick={() => handleAction(req._id, 'approved')}
                      disabled={processingId === req._id}
                      className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-50"
                    >
                      <CheckCircle size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {requests.length === 0 && (
          <div className="py-32 text-center space-y-4">
            <Clock size={48} className="mx-auto text-gray-800" />
            <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px]">
              Ledger is Clear. No Pending Injections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

