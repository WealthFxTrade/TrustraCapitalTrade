import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ExternalLink, RefreshCw, ShieldAlert } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      // This endpoint should return all users' ledger entries where type === 'withdrawal'
      const res = await api.get('/admin/transactions/pending'); 
      setRequests(res.data.queue);
    } catch (err) {
      toast.error("Queue Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const processRequest = async (userId, ledgerId, action) => {
    const loadId = toast.loading(`Executing ${action} Protocol...`);
    try {
      await api.post(`/admin/transactions/process`, { userId, ledgerId, action });
      toast.success(`Transaction ${action === 'approve' ? 'Finalized' : 'Voided'}`, { id: loadId });
      fetchQueue();
    } catch (err) {
      toast.error("Handshake Error", { id: loadId });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Extraction Queue</h2>
        <button onClick={fetchQueue} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid gap-4">
        {requests.map((req) => (
          <div key={req._id} className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-yellow-500/10 rounded-2xl text-yellow-500">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Investor Node</p>
                <p className="font-bold italic">{req.userEmail}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-yellow-500 font-bold">€{req.amount}</span>
                  <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded text-gray-400 uppercase">{req.currency}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-md px-6 border-l border-white/5">
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Destination Hash</p>
              <code className="text-[10px] font-mono text-gray-400 break-all">{req.address}</code>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => processRequest(req.userId, req._id, 'reject')}
                className="px-6 py-3 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all"
              >
                Void
              </button>
              <button 
                onClick={() => processRequest(req.userId, req._id, 'approve')}
                className="px-8 py-3 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                Approve & Settle
              </button>
            </div>
          </div>
        ))}

        {requests.length === 0 && !loading && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <ShieldAlert className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">No Pending Extractions in Buffer</p>
          </div>
        )}
      </div>
    </div>
  );
}
