import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
// FIXED: Default import to match 'export default api' in apiService.js
import api from '../api/apiService'; 
import { User, Trash2, Save, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({});

  const loadUsers = useCallback(async (signal) => {
    try {
      setLoading(true);
      setFetchError(null);
      // Fetches from https://trustracapitaltrade-backend.onrender.com
      const response = await api.get('/admin/users', { signal });
      const usersArray = response.data?.users || response.data || [];
      setUsers(usersArray);

      const initialForm = {};
      usersArray.forEach((u) => {
        initialForm[u._id] = {
          balance: Number(u.balance ?? 0).toFixed(2),
          plan: u.plan || 'Basic',
        };
      });
      setFormData(initialForm);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Admin Load Error:', err);
      const msg = err.response?.status === 401 || err.response?.status === 403
        ? 'Access Denied: Admin session invalid'
        : 'Backend unreachable. Wake up the Render server.';
      setFetchError(msg);
      toast.error(msg);
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
    setFormData(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value }
    }));
  };

  const updateUser = async (userId) => {
    const values = formData[userId];
    if (!values) return;

    const balanceNum = Number(values.balance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      toast.error('Invalid balance amount');
      return;
    }

    setUpdatingId(userId);
    try {
      const payload = { balance: balanceNum, plan: values.plan.trim() };
      await api.put(`/admin/users/${userId}`, payload);
      toast.success('User updated');
      loadUsers(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete user permanently?')) return;
    setDeletingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User removed');
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400">Loading Management System...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <User className="text-indigo-500" /> Admin Panel
          </h1>
          <button onClick={() => loadUsers()} className="p-2 hover:bg-slate-800 rounded-lg">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {fetchError ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-200">{fetchError}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user._id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl flex flex-col lg:flex-row items-center gap-6">
                <div className="flex-1 w-full">
                  <p className="font-semibold text-slate-200">{user.email}</p>
                  <p className="text-[10px] text-slate-500 font-mono uppercase">ID: {user._id}</p>
                </div>

                <div className="flex gap-4 items-center w-full lg:w-auto">
                  <input
                    type="number"
                    value={formData[user._id]?.balance || ''}
                    onChange={(e) => handleInputChange(user._id, 'balance', e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 w-32 text-sm outline-none focus:border-indigo-500"
                    placeholder="Balance"
                  />
                  <select
                    value={formData[user._id]?.plan || 'Basic'}
                    onChange={(e) => handleInputChange(user._id, 'plan', e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="flex gap-2 w-full lg:w-auto">
                  <button
                    onClick={() => updateUser(user._id)}
                    disabled={updatingId === user._id}
                    className="flex-1 p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition disabled:opacity-50"
                  >
                    {updatingId === user._id ? <RefreshCw className="h-4 w-4 animate-spin mx-auto" /> : <Save className="h-4 w-4 mx-auto" />}
                  </button>
                  <button
                    onClick={() => deleteUser(user._id)}
                    disabled={deletingId === user._id}
                    className="flex-1 p-3 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition disabled:opacity-50"
                  >
                    {deletingId === user._id ? <RefreshCw className="h-4 w-4 animate-spin mx-auto" /> : <Trash2 className="h-4 w-4 mx-auto" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

