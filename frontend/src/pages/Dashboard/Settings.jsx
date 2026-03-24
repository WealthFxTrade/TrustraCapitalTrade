// src/pages/Dashboard/Settings.jsx
import React, { useState, useEffect } from 'react';
import {
  User, Lock, Bell, Shield,
  Smartphone, Globe, Mail, Eye,
  EyeOff, ChevronRight, Save,
  AlertCircle, Key, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/api';

export default function Settings() {
  const { user, refreshAuth, logout } = useAuth(); // Assume logout exists in context; add if not

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({}); // per-field errors
  const [globalError, setGlobalError] = useState(null);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    language: user?.language || 'English (UK)',
    timezone: user?.timezone || 'UTC +1 (Zurich)',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [enable2FA, setEnable2FA] = useState(user?.twoFactorEnabled || false); // placeholder

  // Sync with user context when it changes
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        language: user.language || 'English (UK)',
        timezone: user.timezone || 'UTC +1 (Zurich)',
      });
      setEnable2FA(user.twoFactorEnabled || false);
    }
  }, [user]);

  // Basic client-side validation
  const validateProfile = () => {
    const errors = {};
    if (!profileData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!profileData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profileData.email)) errors.email = 'Invalid email format';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Current password required';
    if (!passwordData.newPassword) errors.newPassword = 'New password required';
    else if (passwordData.newPassword.length < 8) errors.newPassword = 'Minimum 8 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFormErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' })); // clear error on change
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return toast.error('Please fix the errors in the form');

    setLoading(true);
    setGlobalError(null);

    try {
      const payload = {
        name: profileData.fullName.trim(),
        email: profileData.email.trim(),
        // language & timezone if backend supports
      };

      await api.put('/user/update-profile', payload); // or your real endpoint
      toast.success('Profile updated successfully');
      refreshAuth();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return toast.error('Please fix password fields');

    setLoading(true);
    setGlobalError(null);

    try {
      await api.put('/user/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    // Placeholder – real impl needs QR code generation, secret, verification
    try {
      // await api.post('/user/2fa/toggle', { enable: !enable2FA });
      setEnable2FA(!enable2FA);
      toast.success(`2FA ${enable2FA ? 'disabled' : 'enabled'} (demo)`);
    } catch (err) {
      toast.error('Failed to toggle 2FA');
    }
  };

  const getErrorMessage = (err) => {
    if (err.response?.data?.message) return err.response.data.message;
    const status = err.response?.status;
    if (status === 400) return 'Invalid input. Check your details.';
    if (status === 401 || status === 403) return 'Unauthorized. Please log in again.';
    if (!err.response) return 'Network error – check your connection.';
    if (status >= 500) return 'Server error – try again later.';
    return 'An unexpected error occurred.';
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

        {/* Global Error */}
        {globalError && (
          <div className="bg-rose-900/30 border border-rose-800 text-rose-200 p-5 rounded-2xl flex items-start gap-3">
            <AlertCircle size={20} className="mt-1 flex-shrink-0" />
            <p>{globalError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Nav Tabs */}
          <div className="lg:col-span-3 space-y-2">
            {[
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'security', icon: Lock, label: 'Security' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'privacy', icon: Shield, label: 'Privacy' },
            ].map((tab) => (
              <button
                key={tab.id}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                aria-label={`Go to ${tab.label} settings`}
              >
                <tab.icon size={18} className="text-gray-500 group-hover:text-yellow-500 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">
                  {tab.label}
                </span>
                <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Main Panels */}
          <div className="lg:col-span-9 space-y-8">
            {/* Profile Section */}
            <section className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-yellow-500/60 mb-8 flex items-center gap-3">
                <User size={16} /> Identity Parameters
              </h3>

              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label htmlFor="fullName" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">
                    Full Legal Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    required
                    className={`w-full bg-black/40 border ${formErrors.fullName ? 'border-rose-500' : 'border-white/5'} rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-yellow-500/30 transition-all`}
                    placeholder="Your full name"
                  />
                  {formErrors.fullName && <p className="text-rose-400 text-xs mt-1 ml-2">{formErrors.fullName}</p>}
                </div>

                <div className="space-y-3">
                  <label htmlFor="email" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">
                    Email Node *
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled // usually not changeable without verification
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-sm font-bold text-gray-500 cursor-not-allowed outline-none"
                  />
                  {formErrors.email && <p className="text-rose-400 text-xs mt-1 ml-2">{formErrors.email}</p>}
                </div>

                <div className="space-y-3">
                  <label htmlFor="language" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">
                    Interface Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={profileData.language}
                    onChange={handleProfileChange}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-yellow-500/30 transition-all appearance-none"
                  >
                    <option>English (UK)</option>
                    <option>English (US)</option>
                    <option>German (CH)</option>
                    <option>French (FR)</option>
                    <option>Spanish (ES)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label htmlFor="timezone" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={profileData.timezone}
                    onChange={handleProfileChange}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-yellow-500/30 transition-all appearance-none"
                  >
                    <option>UTC +1 (Zurich)</option>
                    <option>UTC +0 (London)</option>
                    <option>UTC -5 (New York)</option>
                    <option>UTC +8 (Singapore)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-5 text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 transition-all ${
                      loading ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-yellow-500'
                    }`}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={14} /> Save Profile</>}
                  </button>
                </div>
              </form>
            </section>

            {/* Security Section */}
            <section className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                <Key size={180} className="text-rose-500" />
              </div>

              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-rose-500/60 mb-8 flex items-center gap-3">
                <Lock size={16} /> Encryption Key Rotation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="space-y-3">
                    <label htmlFor="currentPassword" className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        className={`w-full bg-black/40 border ${formErrors.currentPassword ? 'border-rose-500' : 'border-white/5'} rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-rose-500/30 transition-all`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white focus:outline-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {formErrors.currentPassword && <p className="text-rose-400 text-xs mt-1">{formErrors.currentPassword}</p>}
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="newPassword" className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                      New Password *
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className={`w-full bg-black/40 border ${formErrors.newPassword ? 'border-rose-500' : 'border-white/5'} rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-rose-500/30 transition-all`}
                      placeholder="••••••••"
                    />
                    {formErrors.newPassword && <p className="text-rose-400 text-xs mt-1">{formErrors.newPassword}</p>}
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="confirmPassword" className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                      Confirm New Password *
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className={`w-full bg-black/40 border ${formErrors.confirmPassword ? 'border-rose-500' : 'border-white/5'} rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-rose-500/30 transition-all`}
                      placeholder="••••••••"
                    />
                    {formErrors.confirmPassword && <p className="text-rose-400 text-xs mt-1">{formErrors.confirmPassword}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-5 text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 transition-all ${
                      loading ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-rose-500 text-white hover:bg-rose-600'
                    }`}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={14} /> Update Password</>}
                  </button>
                </form>

                {/* 2FA Card */}
                <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-3xl space-y-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-rose-500 mb-4">
                      <Smartphone size={20} />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Two-Factor Authentication (2FA)</h4>
                    </div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed mb-6">
                      Adds a secondary layer of protection. Strongly recommended for all account actions.
                    </p>
                  </div>

                  <button
                    onClick={handleToggle2FA}
                    className={`w-full py-4 text-[9px] font-black uppercase rounded-xl transition-all ${
                      enable2FA
                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white'
                        : 'bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white'
                    }`}
                  >
                    {enable2FA ? '2FA Enabled – Manage' : 'Enable 2FA Now'}
                  </button>

                  {enable2FA && (
                    <p className="text-[9px] text-gray-600 text-center">
                      Setup via authenticator app (Google Authenticator, Authy, etc.)
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Logout Button */}
            <div className="flex justify-end">
              <button
                onClick={logout}
                className="flex items-center gap-2 px-8 py-4 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-800 text-rose-300 rounded-2xl text-sm font-bold transition-all"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
