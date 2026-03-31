import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../constants/api'; // ← centralized

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

export default function DepositApprovalTable({ token }) {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const endpoint = API_ENDPOINTS.ADMIN_DEPOSITS || '/admin/deposits';
      const res = await fetch(`\( {BACKEND_URL} \){endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load pending deposits');
      setDeposits(data.deposits || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load deposits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 30000); // auto-refresh
    return () => clearInterval(interval);
  }, [token]);

  const handleAction = async (id, action) => {
    const msg = `CONFIRM: ${action.toUpperCase()} this deposit?`;
    if (!window.confirm(msg)) return;

    try {
      const endpoint = API_ENDPOINTS.ADMIN_DEPOSITS || '/admin/deposits';
      const res = await fetch(`\( {BACKEND_URL} \){endpoint}/\( {id}/ \){action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');
      toast.success(`Deposit ${action}d`);
      fetchPending();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="ml-3 text-gray-300">Loading pending deposits...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center text-red-300">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-xl font-bold">Pending Deposit Reviews</h3>
        <button
          onClick={fetchPending}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm flex items-center gap-2 transition"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {deposits.length === 0 ? (
        <p className="p-8 text-center text-gray-400">No pending deposits</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-left text-sm text-gray-400">
                <th className="p-4">User</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">TXID / Ref</th>
                <th className="p-4">Requested</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d._id} className="border-b border-gray-800 hover:bg-gray-700/50">
                  <td className="p-4">{d.user?.fullName || d.user?.email || 'Unknown'}</td>
                  <td className="p-4 font-medium text-green-400">${d.amount?.toLocaleString() || '0.00'}</td>
                  <td className="p-4">{d.method || '—'}</td>
                  <td className="p-4 font-mono text-sm text-gray-400">{d.txHash || '—'}</td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(d.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-right flex gap-2 justify-end">
                    <button
                      onClick={() => handleAction(d._id, 'approve')}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center gap-1 transition"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(d._id, 'reject')}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center gap-1 transition"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
