// src/pages/Dashboard/Profile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, Phone, Lock, Save } from 'lucide-react';

export default function Profile() {
  const { user, setUser, refreshSession } = useAuth();

  const [loading, setLoading] = useState(false);
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
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  // Sync user data into form
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  // Fetch latest stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get(API_ENDPOINTS.USER.STATS);

      if (res.data?.success) {
        const data = res.data;
        setStats({
          principal: Number(data.principal || 0),
          availableBalance: Number(data.availableBalance || 0),
          profit: Number(data.accruedROI || 0),
          btc: Number(data.btcBalance || 0),
          eth: Number(data.ethBalance || 0),
          usdt: Number(data.balances?.USDT || 0),
        });
      }
    } catch (err) {
      console.error('Profile stats error:', err);
      // Don't show toast on every render - only on critical failure
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);

  // Update Profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (profile.password && profile.password !== profile.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    const tid = toast.loading('Updating profile...');
    setLoading(true);

    try {
      const payload = {
        name: profile.name,
        phoneNumber: profile.phoneNumber,
      };

      if (profile.password) {
        payload.password = profile.password;
      }

      const res = await api.put(API_ENDPOINTS.USER.PROFILE || '/api/users/profile', payload);

      if (res.data?.success) {
        toast.success('Profile updated successfully', { id: tid });

        // Update global auth context
        setUser((prev) => ({
          ...prev,
          name: profile.name,
          phoneNumber: profile.phoneNumber,
        }));

        // Clear password fields
        setProfile((prev) => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));

        // Optional: Refresh session
        if (refreshSession) refreshSession();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Profile update failed';
      toast.error(msg, { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Balance Overview */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2">
          <ShieldCheck size={16} /> ACCOUNT BALANCES
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Available EUR</p>
            <p className="text-2xl font-bold text-white">
              €{stats.availableBalance.toLocaleString('de-DE')}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Principal</p>
            <p className="text-2xl font-bold text-white">
              €{stats.principal.toLocaleString('de-DE')}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Accrued Profit</p>
            <p className="text-2xl font-bold text-emerald-400">
              €{stats.profit.toLocaleString('de-DE')}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Bitcoin</p>
            <p className="text-xl font-mono">{stats.btc.toFixed(8)} BTC</p>
          </div>
          <div>
            <p className="text-gray-500">Ethereum</p>
            <p className="text-xl font-mono">{stats.eth.toFixed(4)} ETH</p>
          </div>
          <div>
            <p className="text-gray-500">USDT</p>
            <p className="text-xl font-mono">€{stats.usdt.toLocaleString('de-DE')}</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
          <User size={16} /> PERSONAL INFORMATION
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-gray-500 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:border-emerald-500 outline-none"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="tel"
                value={profile.phoneNumber}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:border-emerald-500 outline-none"
                placeholder="+32 000 00 00 00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  value={profile.password}
                  onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:border-emerald-500 outline-none"
                  placeholder="New password (optional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  value={profile.confirmPassword}
                  onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:border-emerald-500 outline-none"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-black font-bold rounded-2xl flex items-center justify-center gap-3 transition-all"
          >
            <Save size={18} />
            {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
