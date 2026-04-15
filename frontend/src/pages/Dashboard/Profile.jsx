// src/pages/Dashboard/Profile.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  Save,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

export default function Profile({ refreshSession }) {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [initialProfile, setInitialProfile] = useState({});

  // Initialize profile data from Auth Context
  useEffect(() => {
    if (user) {
      const data = {
        name: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        confirmPassword: '',
      };
      setProfile(data);
      setInitialProfile(data);
    }
  }, [user]);

  const hasChanges =
    profile.name.trim() !== (initialProfile.name || '').trim() ||
    profile.phone.trim() !== (initialProfile.phone || '').trim() ||
    profile.password.trim() !== '';

  const validateForm = () => {
    const newErrors = {};
    if (!profile.name.trim()) newErrors.name = 'Full identity name required';
    if (profile.phone.trim() && !/^\+?[1-9]\d{1,14}$/.test(profile.phone.trim())) {
      newErrors.phone = 'Invalid international format';
    }
    if (profile.password.trim()) {
      if (profile.password.length < 8) newErrors.password = 'Min 8 characters required';
      if (profile.password !== profile.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUpdating(true);
    const toastId = toast.loading("Updating Identity Ledger...");

    try {
      const payload = {
        name: profile.name.trim(),
        phone: profile.phone.trim() || undefined,
      };
      if (profile.password.trim()) payload.password = profile.password.trim();

      const res = await api.put(API_ENDPOINTS.USER.PROFILE, payload);

      if (res.data?.success) {
        toast.success('Vault Identity Synchronized', { id: toastId });
        // Update the global AuthContext so the Dashboard header updates immediately
        if (refreshSession) await refreshSession();
        
        setInitialProfile({ ...profile, password: '', confirmPassword: '' });
        setProfile(p => ({ ...p, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Sync failed';
      toast.error(msg, { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Profile Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Security & Identity</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 flex items-center gap-2">
            <ShieldCheck size={12} className="text-emerald-500" /> Managed Node: {user?.role?.toUpperCase()} Access
          </p>
        </div>
        <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">2FA Active</span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-black/20 border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-emerald-500" size={18} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Basic Information</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Full Identity Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className={`w-full bg-black border ${errors.name ? 'border-rose-500' : 'border-white/5'} p-4 rounded-2xl text-xs font-bold text-white focus:border-emerald-500 outline-none transition-all`}
                  />
                </div>
                {errors.name && <p className="text-rose-500 text-[9px] font-black uppercase ml-2">{errors.name}</p>}
              </div>

              <div className="space-y-2 opacity-60">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Email Address (Primary)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-black/50 border border-white/5 p-4 pl-12 rounded-2xl text-xs font-bold text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Secure Phone Contact</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 234 567 890"
                    className="w-full bg-black border border-white/5 p-4 pl-12 rounded-2xl text-xs font-bold text-white focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-black/20 border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-amber-500" size={18} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Security Override</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={profile.password}
                    onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                    className="w-full bg-black border border-white/5 p-4 rounded-2xl text-xs font-bold text-white focus:border-emerald-500 outline-none transition-all pr-12"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Confirm Override</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={profile.confirmPassword}
                  onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                  className={`w-full bg-black border ${errors.confirmPassword ? 'border-rose-500' : 'border-white/5'} p-4 rounded-2xl text-xs font-bold text-white focus:border-emerald-500 outline-none transition-all`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 bg-[#0a0c10] border border-white/5 rounded-[2rem] space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Account Status</p>
                <p className="text-sm font-black italic text-emerald-500 uppercase tracking-tighter">Verified Client</p>
              </div>
            </div>
            
            <div className="space-y-4 border-t border-white/5 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-gray-600">KYC Level</span>
                <span className="text-[10px] font-bold text-white">Tier 3 (Institutional)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-gray-600">Last Sync</span>
                <span className="text-[10px] font-bold text-white">{new Date().toLocaleDateString('de-DE')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!hasChanges || updating}
              className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                hasChanges 
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95' 
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              {updating ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
              {updating ? 'Synchronizing...' : 'Push Profile Changes'}
            </button>
          </div>

          <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] space-y-3">
             <div className="flex items-center gap-2 text-blue-500">
                <CheckCircle2 size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Node Compliance</span>
             </div>
             <p className="text-[9px] text-blue-300/60 font-medium leading-relaxed uppercase tracking-wider">
               Identity changes are recorded on the internal audit ledger for compliance with AML-v5 protocols.
             </p>
          </div>
        </div>
      </form>
    </div>
  );
}

