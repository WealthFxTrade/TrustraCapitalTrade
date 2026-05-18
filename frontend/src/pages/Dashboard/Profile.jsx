// src/pages/Dashboard/Profile.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { API_ENDPOINTS } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  User,
  Phone,
  Lock,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Calendar,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export default function Profile({ balances = {} }) {
  const { user, refreshSession } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  // Load user data
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (profile.password && profile.password !== profile.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    if (profile.password && profile.password.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    }

    setLoading(true);

    try {
      const payload = {
        name: profile.name.trim(),
        phoneNumber: profile.phoneNumber.trim(),
      };

      if (profile.password) {
        payload.password = profile.password;
      }

      const res = await api.put(
        API_ENDPOINTS.USER.PROFILE || '/users/profile',
        payload
      );

      if (res.data?.success) {
        toast.success('Profile updated successfully!');

        // Clear password fields
        setProfile((prev) => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));

        if (refreshSession) {
          await refreshSession();
        }
      } else {
        toast.error(res.data?.message || 'Failed to update profile');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'An error occurred while updating profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (value, decimals = 2) => {
    const num = Number(value || 0);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Account Overview */}
      <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-8">
        <h3 className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest mb-6">
          <ShieldCheck size={18} /> Account Overview
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Available', value: `€${Number(balances?.EUR || 0).toLocaleString()}`, color: 'text-white' },
            { label: 'Total Profit', value: `€${Number(balances?.ROI || 0).toLocaleString()}`, color: 'text-emerald-400' },
            { label: 'Bitcoin', value: `${formatBalance(balances?.BTC, 8)} BTC`, color: 'text-orange-400' },
            { label: 'Ethereum', value: `${formatBalance(balances?.ETH, 6)} ETH`, color: 'text-blue-400' },
          ].map((item, idx) => (
            <div key={idx} className="bg-black/40 border border-white/5 rounded-2xl p-6">
              <p className="text-xs uppercase tracking-widest text-gray-500">{item.label}</p>
              <p className={`text-2xl font-black mt-2 ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-8 md:p-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Profile Settings</h2>
          <p className="text-gray-400 mt-1">Manage your personal information and account security</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email (Non-editable) */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 py-4 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 py-4 focus:border-emerald-500 outline-none transition"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 py-4 focus:border-emerald-500 outline-none transition"
                  placeholder="+234 801 234 5678"
                />
              </div>
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Member Since</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                  disabled
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 py-4 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Lock size={20} /> Security Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                  New Password <span className="text-gray-600">(Optional)</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={profile.password}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 pr-12 py-4 focus:border-emerald-500 outline-none transition"
                    placeholder="New password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={profile.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 pr-12 py-4 focus:border-emerald-500 outline-none transition"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 py-5 bg-white hover:bg-emerald-500 active:bg-emerald-600 text-black font-black text-lg rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                UPDATING PROFILE...
              </>
            ) : (
              <>
                <Save size={22} />
                SAVE CHANGES
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
