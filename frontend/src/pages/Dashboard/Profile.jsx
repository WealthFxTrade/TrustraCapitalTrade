// frontend/src/pages/Dashboard/Profile.jsx

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  // ✅ FIXED STATE (matches backend exactly)
  const [stats, setStats] = useState({
    principal: 0,
    availableBalance: 0,
    profit: 0,
    btc: 0,
    eth: 0,
    usdt: 0,
  });

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Sync user data into form
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        phone: user.phoneNumber || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  // =========================
  // ✅ FIXED STATS FETCH
  // =========================
  const fetchStats = async () => {
    try {
      const res = await api.get('/users/stats');
      const data = res.data;

      setStats({
        principal: Number(data.principal || 0),
        availableBalance: Number(data.availableBalance || 0),
        profit: Number(data.accruedROI || 0),
        btc: Number(data.btcBalance || 0),
        eth: Number(data.balances?.ETH || 0),
        usdt: Number(data.balances?.USDT || 0),
      });

    } catch (err) {
      console.error('Stats error:', err);
      toast.error('Failed to load dashboard data');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // =========================
  // PROFILE UPDATE (SAFE)
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const tid = toast.loading('Updating profile...');

    try {
      setLoading(true);

      // password validation (safe)
      if (
        profile.password &&
        profile.password !== profile.confirmPassword
      ) {
        toast.error('Passwords do not match', { id: tid });
        setLoading(false);
        return;
      }

      await api.put('/users/profile', {
        name: profile.name,
        phoneNumber: profile.phone,
        password: profile.password || undefined,
      });

      toast.success('Profile updated', { id: tid });

      setProfile((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));

    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Update failed';
      toast.error(msg, { id: tid });

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI (UNCHANGED)
  // =========================
  return (
    <div className="space-y-6">

      {/* BALANCE DISPLAY (FIXED DATA ONLY) */}
      <div className="grid grid-cols-2 gap-4">
        <div>Available: €{stats.availableBalance}</div>
        <div>Principal: €{stats.principal}</div>
        <div>Profit: €{stats.profit}</div>
        <div>BTC: {stats.btc}</div>
        <div>ETH: {stats.eth}</div>
        <div>USDT: {stats.usdt}</div>
      </div>

      {/* PROFILE FORM (UNCHANGED UI) */}
      <form onSubmit={handleSubmit} className="space-y-3">

        <input
          value={profile.name}
          onChange={(e) =>
            setProfile({ ...profile, name: e.target.value })
          }
          placeholder="Name"
        />

        <input
          value={profile.phone}
          onChange={(e) =>
            setProfile({ ...profile, phone: e.target.value })
          }
          placeholder="Phone"
        />

        <input
          type="password"
          value={profile.password}
          onChange={(e) =>
            setProfile({ ...profile, password: e.target.value })
          }
          placeholder="New Password"
        />

        <input
          type="password"
          value={profile.confirmPassword}
          onChange={(e) =>
            setProfile({
              ...profile,
              confirmPassword: e.target.value,
            })
          }
          placeholder="Confirm Password"
        />

        <button disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
