import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { API_ENDPOINTS } from '../constants/api';

export default function Profile() {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [initialProfile, setInitialProfile] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      const newProfile = {
        name: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      };
      setProfile(newProfile);
      setInitialProfile(newProfile);
    }
  }, [user]);

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    setProfile(initialProfile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Use centralized endpoint
      const endpoint = API_ENDPOINTS.USER_PROFILE || '/user/profile';
      const res = await api.put(endpoint, {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
      });

      if (res.data?.success) {
        toast.success('Profile updated successfully');
        const updatedUser = { ...user, ...res.data.user || profile };
        setUser(updatedUser);
        setInitialProfile(profile);
      } else {
        toast.error('Update failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const hasChanges = 
    profile.name.trim() !== initialProfile.name.trim() ||
    profile.phone.trim() !== initialProfile.phone.trim();

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 md:p-10 selection:bg-indigo-500/30">
      <div className="max-w-xl mx-auto">
        <div className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <header className="mb-10">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
              Your Profile
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Manage your account information
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition" size={18} />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-sm font-bold outline-none focus:border-indigo-500 transition shadow-inner"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2 opacity-70">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                Email (cannot be changed)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  readOnly
                  value={profile.email}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 pl-12 text-sm font-mono text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                Phone Number
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition" size={18} />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+234 000 000 0000"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-sm font-bold outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Buttons */}
            {hasChanges && (
              <div className="flex gap-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                >
                  {updating ? <RefreshCw className="animate-spin" size={16} /> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            )}
          </form>
        </div>

        <p className="mt-10 text-center text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">
          Profile data is used for account security and communication only.
        </p>
      </div>
    </div>
  );
}
