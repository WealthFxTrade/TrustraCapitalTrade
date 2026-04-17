// frontend/src/pages/Dashboard/Profile.jsx

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [updating, setUpdating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  // ✅ FIXED: matches backend structure safely
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [stats, setStats] = useState({
    principal: 0,
    availableBalance: 0,
    profit: 0,
    btc: 0,
    eth: 0,
    usdt: 0,
  });

  // Sync user context → form
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        password: '',
        confirmPassword: '',
      });

      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  // Load dashboard stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/users/stats');
      const data = res.data;

      setStats({
        principal: data.principal ?? 0,
        availableBalance: data.availableBalance ?? 0,
        profit: data.accruedROI ?? 0,
        btc: data.btcBalance ?? 0,
        eth: data.balances?.ETH ?? 0,
        usdt: data.balances?.USDT ?? 0,
      });

    } catch (err) {
      console.error(err);
      toast.error('Failed to load stats');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle avatar upload
  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Only image files allowed');
    }

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Image must be under 2MB');
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // Submit profile update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const tid = toast.loading('Updating profile...');

    try {
      setUpdating(true);

      // optional validation
      if (profile.password && profile.password !== profile.confirmPassword) {
        toast.error('Passwords do not match', { id: tid });
        setUpdating(false);
        return;
      }

      await api.put('/users/profile', {
        name: profile.name,
        phoneNumber: profile.phone,
        password: profile.password || undefined,
      });

      toast.success('Profile updated successfully', { id: tid });

      setProfile((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));

    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      toast.error(msg, { id: tid });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">

      {/* HEADER */}
      <header className="border-b border-white/10 pb-6">
        <h2 className="text-3xl font-bold">
          Identity Vault
        </h2>

        <p className="text-sm text-gray-400">
          Authenticated: {user?.email}
        </p>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>Principal: €{stats.principal}</div>
        <div>Available: €{stats.availableBalance}</div>
        <div>Profit: €{stats.profit}</div>
        <div>BTC: {stats.btc}</div>
        <div>ETH: {stats.eth}</div>
        <div>USDT: {stats.usdt}</div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Name"
          value={profile.name}
          onChange={(e) =>
            setProfile({ ...profile, name: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Phone"
          value={profile.phone}
          onChange={(e) =>
            setProfile({ ...profile, phone: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="New Password"
          value={profile.password}
          onChange={(e) =>
            setProfile({ ...profile, password: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={profile.confirmPassword}
          onChange={(e) =>
            setProfile({ ...profile, confirmPassword: e.target.value })
          }
        />

        <button
          type="submit"
          disabled={updating}
        >
          {updating ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* AVATAR UPLOAD */}
      <div>
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-800">
          {avatarPreview ? (
            <img src={avatarPreview} alt="avatar" />
          ) : (
            <div className="text-center text-gray-400">No Avatar</div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFile(e.target.files[0])}
          accept="image/*"
        />
      </div>

    </div>
  );
}
