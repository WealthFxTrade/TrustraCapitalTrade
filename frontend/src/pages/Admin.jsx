import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast'; // assuming you're using it elsewhere
import { apiGet, apiPut, apiDelete } from '../api';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form state for each user (controlled inputs)
  const [formData, setFormData] = useState({});

  const loadUsers = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet('/admin/users', { signal });
      setUsers(data || []);
      // Initialize form data
      const initialForm = {};
      data.forEach((u) => {
        initialForm[u._id] = {
          balance: u.balance?.toString() || '0',
          plan: u.plan || 'Basic',
        };
      });
      setFormData(initialForm);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
      toast.error('Could not fetch user list');
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
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }));
  };

  const updateUser = async (userId) => {
    const { balance, plan } = formData[userId] || {};
    if (!balance || isNaN(Number(balance))) {
      toast.error('Invalid balance value');
      return;
    }

    setUpdatingId(userId);
    try {
      const payload = {
        balance: Number(balance),
        plan: plan.trim(),
      };
      const res = await apiPut(`/admin/users/${userId}`, payload);
      toast.success(res.message || 'User updated successfully');
      await loadUsers(new AbortController().signal); // refresh
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(err.message || 'Failed to update user');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    setDeletingId(userId);
    try {
      const res = await apiDelete(`/admin/users/${userId}`);
      toast.success(res.message || 'User deleted');
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin h-12 w-12 border-t-4 border-indigo-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Admin User Management</h1>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-200 px-6 py-4 rounded-xl mb-8 text-center">
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div className="bg-slate-900 p-10 rounded-2xl text-center text-slate-400">
            No users found in the system.
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Balance (USD)</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-medium">{user.email}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData[user._id]?.balance ?? '0'}
                        onChange={(e) => handleInputChange(user._id, 'balance', e.target.value)}
                        className="w-28 bg-slate-800 text-white border border-slate-700 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={formData[user._id]?.plan ?? ''}
                        onChange={(e) => handleInputChange(user._id, 'plan', e.target.value)}
                        className="w-40 bg-slate-800 text-white border border-slate-700 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. Basic, Pro, VIP"
                      />
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button
                        onClick={() => updateUser(user._id)}
                        disabled={updatingId === user._id}
                        className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingId === user._id ? 'Updating...' : 'Update'}
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        disabled={deletingId === user._id}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === user._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
