import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { API_ENDPOINTS } from '../../constants/api';
import { toast } from 'react-hot-toast';
import { Loader2, CheckCircle, XCircle, Banknote } from 'lucide-react';

const WithdrawalManager = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // ── FETCH PENDING QUEUE ──
  const fetchQueue = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(API_ENDPOINTS.ADMIN.WITHDRAWALS || '/admin/withdrawals');
      setWithdrawals(data.data || []);
    } catch (err) {
      toast.error('Failed to sync withdrawal queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  // ── ACTION HANDLER ──
  const handleAction = async (withdrawalId, userId, status) => {
    try {
      setProcessingId(withdrawalId);
      // Calls the PATCH /api/admin/withdrawal/:id route we just built
      await api.patch(`/admin/withdrawal/${withdrawalId}`, {
        status,
        userId
      });

      toast.success(`Transaction ${status} successfully`);
      // Update local state to remove the processed item
      setWithdrawals(prev => prev.filter(w => w._id !== withdrawalId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-yellow-500" /></div>;

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Banknote className="text-yellow-500" /> Withdrawal Queue
        </h3>
        <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-mono">
          {withdrawals.length} PENDING
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
              <th className="p-4">Investor</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Date Requested</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-500 italic">
                  No pending transactions in the vault.
                </td>
              </tr>
            ) : (
              withdrawals.map((w) => (
                <tr key={w._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="text-white font-medium">{w.userName}</div>
                    <div className="text-gray-500 text-sm">{w.email}</div>
                  </td>
                  <td className="p-4 font-mono text-yellow-500">
                    €{Number(w.amount).toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleAction(w._id, w.userId, 'completed')}
                        disabled={processingId === w._id}
                        className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                        title="Approve & Send"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleAction(w._id, w.userId, 'rejected')}
                        disabled={processingId === w._id}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        title="Reject & Refund"
                      >
                        <XCircle size={18} />
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
  );
};

export default WithdrawalManager;
