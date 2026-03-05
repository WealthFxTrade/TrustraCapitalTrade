import React, { useState, useEffect } from 'react';
import { CreditCard, Check, X, ExternalLink, clock } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/admin/withdrawals');
      setRequests(data.withdrawals);
    } catch (err) {
      toast.error("Failed to sync extraction ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, status) => {
    const comment = status === 'rejected' ? window.prompt("Reason for rejection:") : "Approved";
    if (status === 'rejected' && !comment) return;

    const loadId = toast.loading("Processing Extraction...");
    try {
      await api.patch(`/admin/withdrawal/${id}`, { status, adminComment: comment });
      toast.success(`Request ${status}`, { id: loadId });
      fetchRequests();
    } catch (err) {
      toast.error("Handshake Failed", { id: loadId });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Extraction Ledger</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Pending Liquidity Outflows</p>
      </div>

      <div className="bg-[#05070a] border border-white/5 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-gray-500">
            <tr>
              <th className="p-6">Investor</th>
              <th className="p-6">Amount</th>
              <th className="p-6">Destination Node</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[11px]">
            {requests.map((req) => (
              <tr key={req._id} className="hover:bg-white/[0.01]">
                <td className="p-6">
                  <p className="text-white font-bold">{req.username}</p>
                  <p className="text-[9px] text-gray-600">{req.email}</p>
                </td>
                <td className="p-6">
                  <span className="text-yellow-500 font-black">€{req.amount.toLocaleString()}</span>
                </td>
                <td className="p-6">
                  <p className="text-gray-400 truncate w-32">{req.address}</p>
                  <span className="text-[8px] px-1 bg-white/5 rounded text-gray-500 uppercase">{req.currency}</span>
                </td>
                <td className="p-6">
                  <span className={`uppercase font-black text-[9px] ${
                    req.status === 'pending' ? 'text-yellow-500' : 
                    req.status === 'completed' ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  {req.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleAction(req._id, 'rejected')} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"><X size={16} /></button>
                      <button onClick={() => handleAction(req._id, 'completed')} className="p-2 bg-emerald-500 text-black rounded-lg hover:bg-white transition-all"><Check size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
