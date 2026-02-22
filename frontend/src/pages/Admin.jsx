import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, Trash2, DollarSign } from 'lucide-react';
import { fetchUsers, updateUser, deleteUser, distributeProfit } from '../api/api';
import toast from 'react-hot-toast'; // Recommended for cleaner UI than alert()

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [profitId, setProfitId] = useState(null);

  const loadUsers = async () => {
    try {
      const res = await fetchUsers();
      // SYNC: Backend sends { users: [] } inside data
      const userData = res.data.users || res.data;
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleInputChange = (userId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value }
    }));
  };

  const handleUpdate = async (userId) => {
    setUpdatingId(userId);
    try {
      // SYNC: Sends merged data to the update endpoint
      await updateUser(userId, formData[userId] || {});
      toast.success('User protocol updated');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleProfit = async (userId) => {
    const amount = prompt("Enter profit amount to distribute (€):", "50");
    if (!amount || isNaN(amount)) return;

    setProfitId(userId);
    try {
      // SYNC: Matches backend's expected { amount } payload
      await distributeProfit(userId, { amount: Number(amount) });
      toast.success(`€${amount} distributed`);
      loadUsers(); // Refresh to show new balance
    } catch (err) {
      toast.error('Distribution failed');
    } finally {
      setProfitId(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Confirm permanent deletion?')) return;
    setDeletingId(userId);
    try {
      await deleteUser(userId);
      toast.error('Backend: Delete Not Implemented (501)');
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-blue-500 font-mono tracking-widest uppercase animate-pulse">
      Initialising Admin Protocol...
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-blue-500 tracking-tighter uppercase">Admin Command Center</h1>
          <button onClick={loadUsers} className="text-gray-500 hover:text-white transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Identity</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Node Plan</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Equity (€)</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-200">{user.fullName || user.email}</div>
                      <div className="text-[9px] text-gray-600 font-mono tracking-tighter">{user._id}</div>
                    </td>
                    <td className="px-8 py-6">
                      <select
                        value={formData[user._id]?.activePlan ?? user.activePlan ?? 'None'}
                        onChange={(e) => handleInputChange(user._id, 'activePlan', e.target.value)}
                        className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-gray-400 text-[10px] font-bold outline-none focus:border-blue-500"
                      >
                        <option value="None">No Active Plan</option>
                        <option value="Starter">Rio Starter</option>
                        <option value="Advanced">Rio Advanced</option>
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <input
                        type="number"
                        value={formData[user._id]?.mainBalance ?? user.balances?.EUR ?? 0}
                        onChange={(e) => handleInputChange(user._id, 'mainBalance', Number(e.target.value))}
                        className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-emerald-500 text-[11px] font-mono font-bold outline-none w-28 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleUpdate(user._id)} className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                          {updatingId === user._id ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                        </button>
                        <button onClick={() => handleProfit(user._id)} className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                          {profitId === user._id ? <RefreshCw className="animate-spin" size={14} /> : <DollarSign size={14} />}
                        </button>
                        <button onClick={() => handleDelete(user._id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={14} />
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

