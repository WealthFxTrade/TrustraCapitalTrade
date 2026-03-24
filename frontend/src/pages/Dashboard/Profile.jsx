// src/pages/Dashboard/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, Save, RefreshCw, ShieldCheck, ChevronLeft,
  AlertCircle, Lock, Eye, EyeOff, CheckCircle2, XCircle,
} from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [initialProfile, setInitialProfile] = useState({});

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/users/profile');
        if (res.data?.success && res.data?.user) {
          const data = res.data.user;
          const current = {
            name: data.name || data.fullName || data.username || '',
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
        toast.error(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
      newErrors.phone = 'Invalid phone format (use international, e.g. +234...)';
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
    setProfile(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleReset = () => {
    setProfile(initialProfile);
    setErrors({});
    toast('Changes discarded', { icon: '↩️' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
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
        toast.success('Profile updated successfully', { icon: '🔒' });
        await refreshAuth(); // Update context
        setInitialProfile(profile);
        setProfile(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setErrors({});
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 400 ? 'Invalid profile data' : 'Update failed – please try again');
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-8">
        <Loader2 className="text-yellow-500 animate-spin" size={56} />
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-yellow-500/50 mb-2">
            Syncing Identity Node
          </p>
          <p className="text-gray-500 text-sm">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 font-sans selection:bg-yellow-500/30">
      <div className="max-w-2xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-yellow-500 transition-colors"
            aria-label="Return to previous page"
          >
            <ChevronLeft size={16} /> Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">
              Identity <span className="text-yellow-500">Node</span>
            </h1>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400">
              <ShieldCheck size={14} className="text-emerald-500" /> Secure Sync
            </div>
          </div>
        </header>

        {/* Form Card */}
        <div className="bg-[#0a0c10] border border-white/8 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
            <User size={180} className="text-yellow-500/20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            {/* Name Field */}
            <div className="space-y-3">
              <label htmlFor="name" className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2 flex items-center gap-2">
                Full Legal Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`w-full bg-black/50 border ${errors.name ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-yellow-500/50'} rounded-2xl p-5 pl-14 text-sm font-bold outline-none transition-all placeholder:text-gray-600`}
                  placeholder="Enter your full legal name"
                />
              </div>
              {errors.name && (
                <p id="name-error" className="text-rose-400 text-xs mt-1 ml-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.name}
                </p>
              )}
            </div>

            {/* Email Field (Static) */}
            <div className="space-y-3 opacity-70">
              <label htmlFor="email" className="text-[10px] font-black uppercase text-gray-600 tracking-[0.3em] ml-2 flex items-center gap-2">
                Email Identifier <span className="text-gray-500">(Immutable)</span>
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full bg-black/30 border border-white/10 rounded-2xl p-5 pl-14 text-sm font-mono text-gray-500 cursor-not-allowed outline-none"
                  title="Email cannot be changed without verification. Contact support if needed."
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-3">
              <label htmlFor="phone" className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2">
                Secure Phone Link (Optional)
              </label>
              <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  className={`w-full bg-black/50 border ${errors.phone ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-yellow-500/50'} rounded-2xl p-5 pl-14 text-sm font-bold outline-none transition-all placeholder:text-gray-600`}
                  placeholder="+234 123 456 7890"
                />
              </div>
              {errors.phone && (
                <p id="phone-error" className="text-rose-400 text-xs mt-1 ml-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.phone}
                </p>
              )}
            </div>

            {/* Password Change (Optional) */}
            <div className="space-y-6 pt-6 border-t border-white/10">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2 flex items-center gap-2">
                Change Password <span className="text-gray-500 text-xs">(Optional)</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={profile.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="New password"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                      className={`w-full bg-black/50 border ${errors.password ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-yellow-500/50'} rounded-2xl p-5 pl-14 text-sm font-bold outline-none transition-all placeholder:text-gray-600`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-rose-400 text-xs flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={profile.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                      className={`w-full bg-black/50 border ${errors.confirmPassword ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-yellow-500/50'} rounded-2xl p-5 pl-14 text-sm font-bold outline-none transition-all placeholder:text-gray-600`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                      aria-label={showConfirmPassword ? 'Hide confirmation' : 'Show confirmation'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p id="confirm-error" className="text-rose-400 text-xs flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {hasChanges && (
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Discard Changes
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className={`flex-1 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all ${
                    updating
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-yellow-500 shadow-lg shadow-yellow-500/20'
                  }`}
                >
                  {updating ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {updating ? 'Syncing...' : 'Sync Identity Node'}
                </button>
              </div>
            )}

            {/* Security Footer */}
            <div className="flex justify-center items-center gap-3 pt-8 opacity-50 text-[9px] font-black uppercase tracking-[0.4em]">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Identity Node • AES-256 Protected • v8.4.1</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
