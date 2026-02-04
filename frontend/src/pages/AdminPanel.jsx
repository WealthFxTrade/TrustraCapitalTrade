// src/pages/AdminPanel.jsx — corrected imports & calls
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api';           // ← changed here

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
      console.error('Failed to load users:', err);
      const msg = err.response?.status === 401 || err.response?.status === 403
        ? 'Unauthorized – please log in as admin'
        : 'Unable to load users. Try again.';
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ... rest of your code remains almost the same ...

  const updateUser = async (userId) => {
    const values = formData[userId];
    if (!values) return;

    const balanceNum = Number(values.balance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      toast.error('Invalid balance');
      return;
    }

    setUpdatingId(userId);
    try {
      const payload = { balance: balanceNum, plan: values.plan.trim() };
      await api.put(`/admin/users/${userId}`, payload);
      toast.success('User updated');
      await loadUsers(new AbortController().signal);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete permanently?')) return;

    setDeletingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  // ... rest of your component (return JSX) stays the same ...
}
