import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function ProfilePage() {
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
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setInitialProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
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
      const res = await api.post('/user/update', {
        name: profile.name,
        phone: profile.phone,
      });
      if (res.data?.success) {
        toast.success('Profile updated');
        setInitialProfile(profile);
        setUser({ ...user, ...profile });
      } else {
        toast.error('Update failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const hasChanges =
    profile.name !== initialProfile.name ||
    profile.phone !== initialProfile.phone;

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 md:p-10 selection:bg-indigo-500/30">
      <div className="max-w-xl mx-auto">
        <div className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          {/* Gradient bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent opacity-30"></div>

          <div className="space-y-8">
            <header className="mb-10">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                Security Node
              </h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Node Active & Verified
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                  Full Identity Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition" size={18} />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-sm font-bold outline-none focus:border-indigo-500 transition shadow-inner"
                  />
                </div>
              </div>

              {/* Email Field (Read Only) */}
              <div className="space-y-2 opacity-60">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                  Email Node (Locked)
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

              {/* Phone Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                  Linked Mobile Link
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition" size={18} />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1234567890"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-sm font-bold outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {hasChanges && (
                <div className="flex gap-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition"
                  >
                    Revert
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20"
                  >
                    {updating ? <RefreshCw className="animate-spin" size={16} /> : <><Save size={16} /> Sync Changes</>}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">
          Trustra Security Protocol • SSL AES-256
        </p>
      </div>
    </div>
  );
}
