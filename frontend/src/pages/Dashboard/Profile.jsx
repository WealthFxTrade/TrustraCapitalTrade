// src/pages/Dashboard/Profile.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, Phone, Lock, Save } from 'lucide-react';

export default function Profile({ balances }) {
  const { user, setUser, refreshSession } = useAuth();
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  // Sync user → form
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

      const res = await api.put(API_ENDPOINTS.USER.PROFILE, payload);

      if (res.data?.success) {
        toast.success('Profile updated successfully', { id: tid });

        setUser((prev) => ({
          ...prev,
          name: profile.name,
          phoneNumber: profile.phoneNumber,
        }));

        setProfile((prev) => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));

        if (refreshSession) await refreshSession();
      } else {
        toast.error(res.data?.message || 'Profile update failed', { id: tid });
      }
    } catch (err) {
      console.error('PROFILE ERROR:', err.response || err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Network error';

      toast.error(msg, { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* ✅ USE DASHBOARD BALANCES */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2">
          <ShieldCheck size={16} /> ACCOUNT BALANCES
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Available EUR</p>
            <p className="text-2xl font-bold text-white">
              €{Number(balances?.EUR || 0).toLocaleString('de-DE')}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Principal</p>
            <p className="text-2xl font-bold text-white">
              €{Number(balances?.INVESTED || 0).toLocaleString('de-DE')}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Accrued Profit</p>
            <p className="text-2xl font-bold text-emerald-400">
              €{Number(balances?.ROI || 0).toLocaleString('de-DE')}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Bitcoin</p>
            <p className="text-xl font-mono">
              {Number(balances?.BTC || 0).toFixed(8)} BTC
            </p>
          </div>

          <div>
            <p className="text-gray-500">Ethereum</p>
            <p className="text-xl font-mono">
              {Number(balances?.ETH || 0).toFixed(4)} ETH
            </p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Full Name"
          />

          <input
            type="tel"
            value={profile.phoneNumber}
            onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
            placeholder="Phone Number"
          />

          <input
            type="password"
            value={profile.password}
            onChange={(e) => setProfile({ ...profile, password: e.target.value })}
            placeholder="New Password"
          />

          <input
            type="password"
            value={profile.confirmPassword}
            onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
            placeholder="Confirm Password"
          />

          <button disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
