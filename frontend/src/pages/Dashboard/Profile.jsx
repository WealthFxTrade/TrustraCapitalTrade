import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, Save, Lock, Eye, EyeOff,
  Loader2, ShieldCheck, CheckCircle2, Upload, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { API_ENDPOINTS } from '../../constants/api';

export default function Profile({ refreshSession }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Sync user → local state
  useEffect(() => {
    if (!user) return;

    setProfile({
      name: user.name || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      password: '',
      confirmPassword: '',
    });

    setAvatarPreview(user.avatar || null);
  }, [user]);

  // File validation
  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Max image size is 2MB');
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // 🔐 Production-safe submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const toastId = toast.loading('Updating profile...');
    setLoading(true);

    try {
      // Validation
      if (!profile.name.trim()) {
        throw new Error('Name is required');
      }

      if (profile.password) {
        if (profile.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        if (profile.password !== profile.confirmPassword) {
          throw new Error('Passwords do not match');
        }
      }

      // Build payload
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('phoneNumber', profile.phone);

      if (profile.password) {
        formData.append('password', profile.password);
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      // API call
      await api.put(API_ENDPOINTS.UPDATE_PROFILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Profile updated successfully', { id: toastId });

      // refresh session if provided
      if (refreshSession) refreshSession();

      // reset sensitive fields only
      setProfile((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));

      setAvatarFile(null);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        'Update failed';

      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">

      {/* HEADER */}
      <div className="border-b border-white/10 pb-6">
        <h2 className="text-3xl font-bold">
          Identity <span className="text-emerald-500">Vault</span>
        </h2>

        <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
          <ShieldCheck size={14} />
          Authenticated • {user?.role} • Node {user?.address_index}
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs">
          {user?.kycStatus === 'verified' ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={14} /> KYC Verified
            </span>
          ) : (
            <span className="text-yellow-400 flex items-center gap-1">
              <AlertCircle size={14} /> KYC Pending
            </span>
          )}
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* LEFT */}
        <div className="space-y-5">

          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Full Name"
            className="w-full p-4 rounded-xl bg-black border border-white/10"
          />

          <input
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="Phone Number"
            className="w-full p-4 rounded-xl bg-black border border-white/10"
          />

          <input
            value={profile.email}
            disabled
            className="w-full p-4 rounded-xl bg-black border border-white/5 opacity-60"
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={profile.password}
              onChange={(e) =>
                setProfile({ ...profile, password: e.target.value })
              }
              placeholder="New Password"
              className="w-full p-4 rounded-xl bg-black border border-white/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-gray-400"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <input
            type={showPassword ? 'text' : 'password'}
            value={profile.confirmPassword}
            onChange={(e) =>
              setProfile({ ...profile, confirmPassword: e.target.value })
            }
            placeholder="Confirm Password"
            className="w-full p-4 rounded-xl bg-black border border-white/10"
          />

          <button
            disabled={loading}
            className="w-full p-4 rounded-xl bg-emerald-500 text-black font-bold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save />}
            Save Profile
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-center justify-start gap-6">

          <div className="w-40 h-40 rounded-full overflow-hidden border border-white/10">
            {avatarPreview ? (
              <img src={avatarPreview} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <User size={40} />
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={(e) => handleFile(e.target.files[0])}
            accept="image/*"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 rounded-lg border border-white/10"
          >
            Upload Avatar
          </button>

        </div>

      </form>
    </div>
  );
}
