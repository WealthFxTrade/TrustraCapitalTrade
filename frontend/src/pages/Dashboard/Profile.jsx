import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  Save,
  RefreshCw,
  ShieldCheck,
  ChevronLeft,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, refreshAuth, isAuthenticated, initialized } = useAuth();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [initialProfile, setInitialProfile] = useState({});

  // Fetch current profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/users/profile');
        if (res.data?.success && res.data?.user) {
          const data = res.data.user;
          const current = {
            name: data.name || data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            password: '',
            confirmPassword: '',
          };
          setProfile(current);
          setInitialProfile(current);
        }
      } catch (err) {
        console.error('Profile fetch failed:', err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (initialized && isAuthenticated) {
      fetchProfile();
    }
  }, [initialized, isAuthenticated]);

  const hasChanges =
    profile.name.trim() !== (initialProfile.name || '').trim() ||
    profile.phone.trim() !== (initialProfile.phone || '').trim() ||
    profile.password.trim() !== '';

  const validateForm = () => {
    const newErrors = {};

    if (!profile.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (profile.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (profile.phone.trim() && !/^\+?[1-9]\d{1,14}$/.test(profile.phone.trim())) {
      newErrors.phone = 'Invalid phone format (e.g. +2348012345678)';
    }

    if (profile.password.trim()) {
      if (profile.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (profile.password !== profile.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const handleReset = () => {
    setProfile(initialProfile);
    setErrors({});
    toast('Changes discarded', { icon: '↩️' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors');
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        name: profile.name.trim(),
        phone: profile.phone.trim() || undefined,
      };

      if (profile.password.trim()) {
        payload.password = profile.password.trim();
      }

      const res = await api.put('/api/users/profile', payload);

      if (res.data?.success) {
        toast.success('Profile updated successfully');
        await refreshAuth?.(); // Update auth context if available
        setInitialProfile(profile);
        setProfile((prev) => ({ ...prev, password: '', confirmPassword: '' }));
        setErrors({});
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: ShieldCheck },
    { path: '/dashboard/deposit', label: 'Deposit', icon: User },
    { path: '/dashboard/withdrawal', label: 'Withdraw', icon: User },
    { path: '/dashboard/ledger', label: 'History', icon: User },
    { path: '/dashboard/profile', label: 'Profile', icon: User, active: true },
  ];

  // Auth & Loading Guard
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-emerald-500 animate-spin" size={56} />
        <p className="text-gray-500 text-sm">Loading profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white flex font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#0a0c10] border-r border-white/5 p-6 h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-12 px-2">
          <ShieldCheck className="text-emerald-500" size={28} />
          <h1 className="text-xl font-bold tracking-tighter">
            TRUSTRA <span className="font-light text-emerald-500">CAPITAL</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all w-full text-left group border ${
                item.active
                  ? 'bg-emerald-600 border-emerald-500 text-black shadow-lg shadow-emerald-900/20'
                  : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} className={item.active ? 'text-black' : 'text-gray-500 group-hover:text-emerald-400'} />
              <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-4 px-5 py-4 text-gray-500 hover:text-red-400 transition-colors mt-auto"
        >
          <LogOut size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">Secure Sign Out</span>
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 w-72 h-full bg-[#0a0c10] border-r border-white/5 p-6 z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-500" size={28} />
                  <h1 className="text-xl font-bold tracking-tighter">
                    TRUSTRA <span className="font-light text-emerald-500">CAPITAL</span>
                  </h1>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={28} />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all w-full text-left group border ${
                      item.active
                        ? 'bg-emerald-600 border-emerald-500 text-black shadow-lg shadow-emerald-900/20'
                        : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} className={item.active ? 'text-black' : 'text-gray-500 group-hover:text-emerald-400'} />
                    <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                  </button>
                ))}
              </nav>

              <button
                onClick={logout}
                className="flex items-center gap-4 px-5 py-4 text-gray-500 hover:text-red-400 transition-colors mt-auto"
              >
                <LogOut size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Secure Sign Out</span>
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 max-w-2xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="flex items-center gap-4 mb-8 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-3 text-gray-400 hover:text-white"
          >
            <Menu size={28} />
          </button>
          <h1 className="text-2xl font-bold">Identity Node</h1>
        </div>

        <div className="bg-[#0a0c10] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
            <User size={180} className="text-emerald-500" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            {/* Name */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2">
                Full Legal Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full bg-black/50 border ${errors.name ? 'border-rose-500' : 'border-white/10'} rounded-2xl p-5 pl-14 text-sm font-bold outline-none focus:border-emerald-500 transition-all`}
                  placeholder="Enter your full legal name"
                />
              </div>
              {errors.name && <p className="text-rose-400 text-xs ml-2">{errors.name}</p>}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2">
                Email Address (Immutable)
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full bg-black/30 border border-white/10 rounded-2xl p-5 pl-14 text-sm font-mono text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full bg-black/50 border ${errors.phone ? 'border-rose-500' : 'border-white/10'} rounded-2xl p-5 pl-14 text-sm font-bold outline-none focus:border-emerald-500 transition-all`}
                  placeholder="+234 801 234 5678"
                />
              </div>
              {errors.phone && <p className="text-rose-400 text-xs ml-2">{errors.phone}</p>}
            </div>

            {/* Password Change */}
            <div className="pt-8 border-t border-white/10 space-y-6">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2">
                Change Password (Optional)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={profile.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="New password"
                    className={`w-full bg-black/50 border ${errors.password ? 'border-rose-500' : 'border-white/10'} rounded-2xl p-5 pl-14 text-sm font-bold outline-none focus:border-emerald-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={profile.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                    className={`w-full bg-black/50 border ${errors.confirmPassword ? 'border-rose-500' : 'border-white/10'} rounded-2xl p-5 pl-14 text-sm font-bold outline-none focus:border-emerald-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {(errors.password || errors.confirmPassword) && (
                <p className="text-rose-400 text-xs ml-2">
                  {errors.password || errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {hasChanges && (
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-black uppercase text-xs tracking-widest transition-all"
                >
                  Discard Changes
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className={`flex-1 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all ${
                    updating
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {updating ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Save size={20} />
                  )}
                  {updating ? 'Syncing...' : 'Update Profile'}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
