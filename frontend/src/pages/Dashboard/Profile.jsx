import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  CheckCircle2,
  Upload,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

export default function Profile({ refreshSession }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [initialProfile, setInitialProfile] = useState({});

  // Initialize profile data
  useEffect(() => {
    if (user) {
      const initialData = {
        name: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || user.phone || '',
        password: '',
        confirmPassword: '',
      };
      setProfile(initialData);
      setInitialProfile(initialData);

      if (user.avatar) setAvatarPreview(user.avatar);
    }
  }, [user]);

  const hasChanges = 
    profile.name.trim() !== (initialProfile.name || '').trim() ||
    profile.phone.trim() !== (initialProfile.phone || '').trim() ||
    profile.password.trim() !== '' ||
    avatarFile !== null;

  const validateForm = () => {
    const newErrors = {};

    if (!profile.name.trim()) newErrors.name = 'Full name is required';

    if (profile.phone.trim() && !/^\+?[1-9]\d{1,14}$/.test(profile.phone.trim())) {
      newErrors.phone = 'Invalid international phone format';
    }

    if (profile.password.trim()) {
      if (profile.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (profile.password !== profile.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file selection (click or drop)
  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload an image file (JPG, PNG, etc.)');
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be smaller than 5MB');
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUpdating(true);
    const toastId = toast.loading("Updating profile...");

    try {
      const payload = {
        name: profile.name.trim(),
        phoneNumber: profile.phone.trim() || undefined,
      };

      if (profile.password.trim()) {
        payload.password = profile.password.trim();
      }

      // Send avatar as base64 (simple & reliable)
      if (avatarPreview) {
        payload.avatar = avatarPreview;
      }

      const res = await api.put(API_ENDPOINTS.USER.PROFILE, payload);

      if (res.data?.success) {
        toast.success('Profile updated successfully', { id: toastId });

        if (refreshSession) await refreshSession();

        // Reset password fields
        setProfile(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setInitialProfile(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg, { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Security & Identity</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-2 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> 
            Managed Institutional Node • {user?.role?.toUpperCase() || 'CLIENT'} Access
          </p>
        </div>
        <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2 text-emerald-400">
          <CheckCircle2 size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">KYC Verified</span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* Avatar Upload with Drag & Drop */}
          <div 
            ref={dropRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-[#0a0c10] border-2 border-dashed rounded-3xl p-10 transition-all duration-200 ${
              isDragging 
                ? 'border-emerald-500 bg-emerald-500/5' 
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 mb-6">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white/10 bg-black">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <User size={48} className="text-gray-600" />
                    </div>
                  )}
                </div>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-full transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <label className="cursor-pointer flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
                <Upload size={18} />
                <span className="text-sm font-semibold">
                  {avatarPreview ? 'Change Avatar' : 'Upload Profile Picture'}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files[0])}
                  className="hidden"
                />
              </label>

              <p className="text-[10px] text-gray-500 mt-4">
                Drag & drop or click • JPG, PNG • Max 5MB
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-10 space-y-8">
            <div className="flex items-center gap-3">
              <User className="text-emerald-500" size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Personal Information</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Full Legal Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className={`w-full bg-black border ${errors.name ? 'border-rose-500' : 'border-white/10'} p-5 rounded-2xl text-white focus:border-emerald-500 outline-none`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-rose-500 text-xs mt-2">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-black/60 border border-white/10 p-5 pl-12 rounded-2xl text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+234 123 456 7890"
                    className="w-full bg-black border border-white/10 p-5 pl-12 rounded-2xl text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                {errors.phone && <p className="text-rose-500 text-xs mt-2">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-10 space-y-8">
            <div className="flex items-center gap-3">
              <Lock className="text-amber-500" size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Change Password</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={profile.password}
                    onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white focus:border-emerald-500 outline-none pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-500 text-xs mt-2">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={profile.confirmPassword}
                  onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                  className={`w-full bg-black border ${errors.confirmPassword ? 'border-rose-500' : 'border-white/10'} p-5 rounded-2xl text-white focus:border-emerald-500 outline-none`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-rose-500 text-xs mt-2">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="text-emerald-500" size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold">Account Status</p>
                <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">VERIFIED • ACTIVE</p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">KYC Status</span>
                <span className="font-semibold text-emerald-400">Tier 3 (Institutional)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-mono text-xs">{new Date().toLocaleDateString('de-DE')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!hasChanges || updating}
              className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                hasChanges
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-black active:scale-[0.98]'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {updating ? 'Saving Changes...' : 'Save Profile Updates'}
            </button>
          </div>

          <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
            <p className="text-xs text-blue-300/70 leading-relaxed">
              All changes including avatar upload are recorded on the immutable audit ledger for compliance.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
