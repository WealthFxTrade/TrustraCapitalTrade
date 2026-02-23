import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

const WithdrawalManager = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get('/admin/withdrawals');
      // Ensure the backend uses .populate('user', 'fullName email')
      setWithdrawals(res.data.withdrawals || []);
    } catch (err) {
      toast.error("Security Node: Failed to sync withdrawal queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleUpdate = async (id, status) => {
    const adminNote = window.prompt(`Reason for ${status.toUpperCase()} (Optional):`);
    if (adminNote === null) return; // User cancelled prompt

    try {
      await api.put(`/admin/withdrawals/${id}`, { status, adminNote });
      toast.success(`Withdrawal status updated to ${status}`);
      fetchWithdrawals(); // Reload list to show changes
    } catch (err) {
      toast.error(err.response?.data?.message || "Internal Node Error");
    }
  };

  if (loading) return <div className="p-8 text-blue-400 animate-pulse">Synchronizing Ledger...</div>;

  return (
    <div className="bg-[#05070a] min-h-screen p-6 text-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold border-l-4 border-blue-600 pl-4">Withdrawal Control Center</h1>
        <button onClick={fetchWithdrawals} className="text-xs bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded">Refresh</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#0b0e14]">
        <table className="w-full text-left">
          <thead className="bg-[#161b22] text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4">Client Node</th>
              <th className="p-4">Amount (EUR)</th>
              <th className="p-4">Network / Asset</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {withdrawals.length === 0 ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-500">No pending withdrawal requests found.</td></tr>
            ) : (
              withdrawals.map((w) => (
                <tr key={w._id} className="hover:bg-[#12161d] transition-all">
                  <td className="p-4">
                    <div className="font-bold">{w.user?.fullName || 'Unknown User'}</div>
                    <div className="text-xs text-gray-500">{w.user?.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-blue-400 font-mono">€{w.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-600 italic">Net: €{w.netAmount}</div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs bg-blue-900/20 text-blue-300 px-2 py-1 rounded">{w.asset}</span>
                    <div className="text-[10px] text-gray-500 mt-1 font-mono truncate max-w-[120px]" title={w.address}>
                      {w.address}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyles[w.status]}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {w.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleUpdate(w._id, 'approved')}
                          className="bg-green-600/10 text-green-500 border border-green-600/20 hover:bg-green-600 hover:text-white px-3 py-1 rounded text-xs transition-all"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdate(w._id, 'rejected')}
                          className="bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}
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

const statusStyles = {
  pending: "bg-yellow-900/30 text-yellow-500",
  approved: "bg-green-900/30 text-green-500",
  rejected: "bg-red-900/30 text-red-500",
  sent: "bg-blue-900/30 text-blue-500",
};

export default WithdrawalManager;
