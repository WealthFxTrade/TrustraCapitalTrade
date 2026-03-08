// src/pages/Dashboard/Settings.jsx
import React, { useState, useEffect } from 'react';
import {
  User, Lock, Bell, Shield,
  Smartphone, Globe, Mail, Eye,
  EyeOff, ChevronRight, Save,
  AlertCircle, Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/api';

export default function Settings() {
  const { user, refreshAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    language: 'English (UK)',
    timezone: 'UTC +1 (Zurich)'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sync form data with user context
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        language: 'English (UK)',
        timezone: 'UTC +1 (Zurich)'
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: profileData.fullName.trim(),
        email: profileData.email.trim(),
      };

      await api.put('/user/update-profile', payload);
      toast.success('Profile updated successfully');
      refreshAuth();
    } catch (err) {
      console.error('Profile update failed:', err);
      const msg = getErrorMessage(err);
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }

    if (passwordData.newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters');
    }

    setLoading(true);
    setError(null);

    try {
      await api.put('/user/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Password update failed:', err);
      const msg = getErrorMessage(err);
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Clear, user-friendly error messages
  const getErrorMessage = (err) => {
    if (err.response?.data?.message) return err.response.data.message;

    const status = err.response?.status;

    if (status === 400) return 'Invalid data provided. Please check your input.';
    if (status === 401 || status === 403) return 'Session expired or unauthorized.';
    if (!err.response && err.request) return 'Cannot reach server. Check your connection.';
    if (status >= 500) return 'Server issue – please try again later.';
    return err.message || 'Failed to update settings.';
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 pt-28 font-sans selection:bg-yellow-500/30">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            System <span className="text-yellow-500">Configuration</span>
          </h1>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-2">
            Node Parameters & Security Clearance
          </p>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-900/30 border border-rose-800 text-rose-200 p-5 rounded-2xl flex items-start gap-3">
            <AlertCircle size={20} className="mt-1 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Navigation Tabs */}
          <div className="lg:col-span-3 space-y-2">
            {[
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'security', icon: Lock, label: 'Security' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'privacy', icon: Shield, label: 'Privacy' }
            ].map((tab) => (
              <button
                key={tab.id}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group hover:bg-white/5"
              >
                <tab.icon size={18} className="text-gray-500 group-hover:text-yellow-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Right: Settings Panels */}
          <div className="lg:col-span-9 space-y-8">
            {/* Profile Section */}
            <section className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-yellow-500/60 mb-8 flex items-center gap-3">
                <User size={16} /> Identity Parameters
              </h3>

              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-yellow-500/30 transition-all"
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">
                    Email Node
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profileData.email}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-sm font-bold text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">
                    Interface Language
                  </label>
                  <select className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-yellow-500/30 transition-all appearance-none">
                    <option>English (UK)</option>
                    <option>German (CH)</option>
                    <option>French (FR)</option>
                  </select>
                </div>

                <div className="space-y-3 flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-5 text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 transition-all ${
                      loading
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-yellow-500'
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save size={14} /> Save Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Security Section */}
            <section className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                <Key size={180} />
              </div>

              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-rose-500/60 mb-8 flex items-center gap-3">
                <Lock size={16} /> Encryption Key Rotation
              </h3>

              <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-rose-500/30 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-rose-500/30 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-rose-500/30 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-5 text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 transition-all ${
                      loading
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-rose-500 text-white hover:bg-rose-600'
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save size={14} /> Update Password
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-rose-500">
                    <AlertCircle size={20} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Two-Factor Auth (2FA)</h4>
                  </div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                    2FA adds a secondary layer of encryption. We strongly recommend enabling this for all capital extractions.
                  </p>
                  <button className="w-full py-4 bg-rose-500/20 text-rose-500 text-[9px] font-black uppercase rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                    Enable Authenticator
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
