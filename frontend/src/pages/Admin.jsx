import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, Trash2, Save, UserCog, ShieldCheck } from 'lucide-react';
import api from '../api/apiService'; // Using your centralized axios instance

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form state for each user
  const [formData, setFormData] = useState({});

  const loadUsers = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      // Endpoint matches backend: app.use('/api/admin', adminRoutes)
      const res = await api.get('/admin/users', { signal });
      const data = res.data?.users || [];
      setUsers(data);
      
      // Initialize form data
      const initialForm = {};
      data.forEach((u) => {
        initialForm[u._id] = {
          mainBalance: u.mainBalance?.toString() || '0',
          activePlan: u.activePlan || 'Rio Starter',
        };
      });
      setFormData(initialForm);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError('System Sync Failed. Please retry.');
      toast.error('Could not fetch user ledger');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadUsers(controller.signal);
    return () => controller.abort();
  }, [loadUsers]);

  const handleInputChange = (userId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  const updateUser = async (userId) => {
    const { mainBalance, activePlan } = formData[userId] || {};
    if (isNaN(Number(mainBalance))) return toast.error('Invalid balance value');

    setUpdatingId(userId);
    try {
      const payload = {
        mainBalance: Number(mainBalance),
        activePlan: activePlan.trim(),
      };
      // Endpoint: /api/admin/users/:id
      await api.put(`/admin/users/${userId}`, payload);
      toast.success('User Protocol Updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('PERMANENT DELETE: Proceed?')) return;
    setDeletingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User Purged');
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      toast.error('Deletion protocol failed');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex justify-between items-center border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <ShieldCheck className="text-blue-500" /> Admin Ledger
            </h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Audit Control v8.4.1</p>
          </div>
          <button onClick={() => loadUsers()} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition">
             <RefreshCw size={18} />
          </button>
        </header>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-xs font-black uppercase tracking-widest">{error}</div>}

        <div className="bg-[#0a0c10] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5">
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <th className="px-8 py-6">User Entity</th>
                <th className="px-8 py-6">Main Balance (€)</th>
                <th className="px-8 py-6">Active Node</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/5 transition">
                  <td className="px-8 py-6">
                    <p className="font-bold text-white text-sm italic">{user.email}</p>
                    <p className="text-[9px] text-gray-600 font-mono">{user._id}</p>
                  </td>
                  <td className="px-8 py-6">
                    <input
                      type="number"
                      value={formData[user._id]?.mainBalance ?? '0'}
                      onChange={(e) => handleInputChange(user._id, 'mainBalance', e.target.value)}
                      className="w-32 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-blue-400 font-mono text-sm focus:border-blue-500 outline-none"
                    />
                  </td>
                  <td className="px-8 py-6">
                    <input
                      type="text"
                      value={formData[user._id]?.activePlan ?? ''}
                      onChange={(e) => handleInputChange(user._id, 'activePlan', e.target.value)}
                      className="w-44 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-black uppercase tracking-widest focus:border-blue-500 outline-none"
                      placeholder="e.g. Rio Elite"
                    />
                  </td>
                  <td className="px-8 py-6 text-right space-x-3">
                    <button
                      onClick={() => updateUser(user._id)}
                      disabled={updatingId === user._id}
                      className="p-3 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition disabled:opacity-50"
                      title="Save Changes"
                    >
                      {updatingId === user._id ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      disabled={deletingId === user._id}
                      className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition disabled:opacity-50"
                      title="Purge User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
             <div className="p-20 text-center text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">No Entities Found</div>
          )}
        </div>
      </div>
    </div>
  );
}

