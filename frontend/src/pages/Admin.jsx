import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, Trash2, DollarSign } from 'lucide-react';
import { fetchUsers, updateUser, deleteUser, distributeProfit } from '../api/api';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [profitId, setProfitId] = useState(null);

  // Load users from backend
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetchUsers();
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Handle input changes per user
  const handleInputChange = (userId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value }
    }));
  };

  // Update user
  const handleUpdate = async (userId) => {
    setUpdatingId(userId);
    try {
      await updateUser(userId, formData[userId] || {});
      alert('User updated successfully!');
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete user (safe handling for 501 placeholder)
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeletingId(userId);
    try {
      await deleteUser(userId); // backend currently returns 501
      alert('Delete is not implemented yet on the backend.');
      // Do NOT remove the user from the table until backend supports deletion
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  // Distribute profit
  const handleProfit = async (userId) => {
    setProfitId(userId);
    try {
      await distributeProfit(userId, { distributeProfit: true });
      alert('Profit distributed successfully!');
    } catch (err) {
      alert('Profit distribution failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setProfitId(null);
    }
  };

  if (loading) return <div className="p-10 text-white bg-black min-h-screen">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-blue-500">Admin Protocol Dashboard</h1>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">User Details</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Investment Plan</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Invested Amount (€)</th>
                  <th className="px-8 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-medium text-gray-200">{user.username || user.email}</div>
                      <div className="text-xs text-gray-500 font-mono">{user._id}</div>
                    </td>
                    <td className="px-8 py-6">
                      <select
                        value={formData[user._id]?.activePlan ?? user.planKey ?? 'basic'}
                        onChange={(e) => handleInputChange(user._id, 'activePlan', e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-gray-300 text-xs font-bold outline-none cursor-pointer focus:border-blue-500"
                      >
                        <option value="basic">Rio Starter</option>
                        <option value="silver">Rio Basic</option>
                        <option value="gold">Rio Standard</option>
                        <option value="platinum">Rio Advanced</option>
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <input
                        type="number"
                        value={formData[user._id]?.investedAmount ?? user.investedAmount ?? 0}
                        onChange={(e) => handleInputChange(user._id, 'investedAmount', Number(e.target.value))}
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-xs font-bold outline-none w-32 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end items-center space-x-2">
                        <button onClick={() => handleUpdate(user._id)} disabled={updatingId === user._id} className="p-3 bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50">
                          {updatingId === user._id ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        </button>
                        <button onClick={() => handleProfit(user._id)} disabled={profitId === user._id} className="p-3 bg-emerald-600/10 text-emerald-500 rounded-xl hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50">
                          {profitId === user._id ? <RefreshCw className="animate-spin" size={16} /> : <DollarSign size={16} />}
                        </button>
                        <button onClick={() => handleDelete(user._id)} disabled={deletingId === user._id} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50">
                          {deletingId === user._id ? <RefreshCw className="animate-spin" size={16} /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
