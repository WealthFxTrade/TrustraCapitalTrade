import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, Phone, Lock, Save, Mail, Loader2 } from 'lucide-react';

export default function Profile({ balances }) {
  const { user, setUser, refreshSession } = useAuth();
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (profile.password && profile.password !== profile.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const payload = { name: profile.name, phoneNumber: profile.phoneNumber };
      if (profile.password) payload.password = profile.password;

      const res = await api.put(API_ENDPOINTS.USER.PROFILE, payload);

      if (res.data?.success) {
        toast.success('Profile updated successfully');
        setUser((prev) => ({ ...prev, ...payload }));
        setProfile((prev) => ({ ...prev, password: '', confirmPassword: '' }));
        if (refreshSession) await refreshSession();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Wallet Overview Card */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-8 flex items-center gap-2">
          <ShieldCheck size={14} /> Security Vault Balances
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Available', val: `€${Number(balances?.EUR || 0).toLocaleString('de-DE')}`, color: 'text-white' },
            { label: 'ROI', val: `€${Number(balances?.ROI || 0).toLocaleString('de-DE')}`, color: 'text-emerald-400' },
            { label: 'Bitcoin', val: `${Number(balances?.BTC || 0).toFixed(6)}`, color: 'text-orange-400' },
            { label: 'Ethereum', val: `${Number(balances?.ETH || 0).toFixed(4)}`, color: 'text-blue-400' },
          ].map((item, i) => (
            <div key={i}>
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">{item.label}</p>
              <p className={`text-xl font-black ${item.color}`}>{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl">
        <div className="mb-10">
          <h2 className="text-2xl font-bold">Account Settings</h2>
          <p className="text-gray-400 text-sm">Update your identity and security credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-4">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 focus:outline-none focus:border-white/30 transition-all"
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-4">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 focus:outline-none focus:border-white/30 transition-all"
                type="tel"
                value={profile.phoneNumber}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-4">New Password (Optional)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 focus:outline-none focus:border-white/30 transition-all"
                type="password"
                placeholder="••••••••"
                value={profile.password}
                onChange={(e) => setProfile({ ...profile, password: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-4">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 focus:outline-none focus:border-white/30 transition-all"
                type="password"
                placeholder="••••••••"
                value={profile.confirmPassword}
                onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              disabled={loading}
              className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {loading ? 'Securing Data...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

