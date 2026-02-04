// src/pages/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { apiGet, apiPut, apiDelete } from '../api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({});

  const loadUsers = useCallback(async (signal) => {
    try {
      setLoading(true);
      setFetchError(null);
      const data = await apiGet('/admin/users', { signal });

      const usersArray = Array.isArray(data) ? data : data?.users || [];
      setUsers(usersArray);

      // Initialize controlled form values
      const initialForm = {};
      usersArray.forEach((u) => {
        initialForm[u._id] = {
          balance: Number(u.balance ?? 0).toFixed(2),
          plan: u.plan || 'Basic',
        };
      });
      setFormData(initialForm);

      setFilteredUsers(usersArray);
    } catch (err) {
      if (err.name === 'AbortError') return;

      console.error('Failed to load users:', err);
      const msg =
        err.status === 401 || err.status === 403
          ? 'Unauthorized. Please log in again as admin.'
          : 'Unable to load user list. Please try again later.';
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

  // Filter users when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter((u) =>
      u.email?.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleInputChange = (userId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  const updateUser = async (userId) => {
    const values = formData[userId];
    if (!values) return;

    const balanceNum = Number(values.balance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      toast.error('Balance must be a valid non-negative number');
      return;
    }

    setUpdatingId(userId);

    try {
      const payload = {
        balance: balanceNum,
        plan: values.plan.trim(),
      };

      const res = await apiPut(`/admin/users/${userId}`, payload);
      toast.success(res.message || 'User updated');

      // Refresh full list
      await loadUsers(new AbortController().signal);
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) {
      return;
    }

    // Optimistic delete
    const oldUsers = [...users];
    setUsers((prev) => prev.filter((u) => u._id !== userId));
    setFilteredUsers((prev) => prev.filter((u) => u._id !== userId));

    setDeletingId(userId);

    try {
      const res = await apiDelete(`/admin/users/${userId}`);
      toast.success(res.message || 'User deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
      // Rollback on error
      setUsers(oldUsers);
      setFilteredUsers(oldUsers);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin h-14 w-14 border-t-4 border-indigo-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold">
            Admin User Management
            <span className="ml-3 text-slate-400 text-xl font-normal">
              ({filteredUsers.length} users)
            </span>
          </h1>

          <input
            type="search"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {fetchError && (
          <div className="bg-red-900/50 border border-red-700 text-red-100 px-6 py-4 rounded-xl mb-8 text-center">
            {fetchError}
          </div>
        )}

        {filteredUsers.length === 0 ? (
          <div className="bg-slate-900 p-12 rounded-2xl text-center text-slate-400 border border-slate-800">
            {searchTerm
              ? `No users found matching "${searchTerm}"`
              : 'No users registered in the system yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Balance (USD)</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData[user._id]?.balance ?? '0.00'}
                        onChange={(e) =>
                          handleInputChange(user._id, 'balance', e.target.value)
                        }
                        disabled={updatingId === user._id}
                        className="w-32 bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={formData[user._id]?.plan ?? ''}
                        onChange={(e) =>
                          handleInputChange(user._id, 'plan', e.target.value)
                        }
                        disabled={updatingId === user._id}
                        className="w-40 bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                        placeholder="Basic, Pro, VIP, ..."
                      />
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button
                        onClick={() => updateUser(user._id)}
                        disabled={updatingId === user._id}
                        className="px-5 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-green-900/30"
                      >
                        {updatingId === user._id ? 'Updating...' : 'Update'}
                      </button>

                      <button
                        onClick={() => deleteUser(user._id)}
                        disabled={deletingId === user._id}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-red-900/30"
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
