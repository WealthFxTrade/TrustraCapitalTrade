// src/components/dashboard/ProfileSettingsModal.jsx
import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  Key,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSettingsModal({ onClose }) {
  const { user, refreshAuth } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
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
      await api.put('/user/profile/update', {
        fullName: profileData.fullName.trim(),
      });
      toast.success('Profile updated successfully');
      refreshAuth();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
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
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      <div className="bg-[#0A0A0A] w-full max-w-3xl rounded-3xl p-12 relative text-white">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">
          Profile & Security Settings
        </h2>

        {error && (
          <div className="bg-rose-900/30 border border-rose-800 text-rose-200 p-4 rounded mb-6 flex items-center gap-3">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase text-gray-500">Full Legal Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                name="fullName"
                value={profileData.fullName}
                onChange={handleProfileChange}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 pl-10 text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase text-gray-500">Email (Static)</label>
            <input
              type="email"
              value={profileData.email}
              readOnly
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black px-6 py-3 rounded-xl font-bold uppercase flex items-center gap-2"
            >
              <Save size={16} /> Save Profile
            </button>
          </div>
        </form>

        {/* Password Form */}
        <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase text-gray-500">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 pr-10 text-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase text-gray-500">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase text-gray-500">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white"
              placeholder="••••••••"
            />
          </div>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-rose-500 text-white px-6 py-3 rounded-xl font-bold uppercase flex items-center gap-2"
            >
              <Save size={16} /> Update Password
            </button>
          </div>
        </form>

        {/* Optional: 2FA Section */}
        <div className="mt-10 bg-rose-500/5 border border-rose-500/10 p-6 rounded-xl">
          <div className="flex items-center gap-3 text-rose-500 mb-2">
            <Key size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest">Two-Factor Authentication (2FA)</h4>
          </div>
          <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed mb-3">
            Adds an extra layer of security for withdrawals and sensitive operations. Strongly recommended.
          </p>
          <button className="w-full py-3 bg-rose-500/20 text-rose-500 text-xs font-bold uppercase rounded-xl hover:bg-rose-500 hover:text-white transition">
            Enable Authenticator
          </button>
        </div>
      </div>
    </div>
  );
}
