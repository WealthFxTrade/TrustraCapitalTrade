import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, RefreshCw, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { API_ENDPOINTS } from '../constants/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
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
      const endpoint = API_ENDPOINTS?.USER_PROFILE || '/user/profile';
      const res = await api.put(endpoint, {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
      });

      if (res.data?.success) {
        toast.success('Identity Protocol Updated');
        const updatedUser = { ...user, ...res.data.user || profile };
        setUser(updatedUser);
        setInitialProfile(profile);
      } else {
        toast.error('Update synchronization failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Handshake Error: Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const hasChanges =
    profile.name.trim() !== initialProfile.name.trim() ||
    profile.phone.trim() !== initialProfile.phone.trim();

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 font-sans selection:bg-yellow-500/30">
      <div className="max-w-2xl mx-auto space-y-10">
        
        {/* Header Navigation */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-yellow-500 transition-colors w-fit"
          >
            <ChevronLeft size={14} /> Return to Terminal
          </button>
          <div className="flex items-center justify-between border-b border-white/5 pb-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                Identity <span className="text-yellow-500">Node</span>
              </h1>
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" /> AES-256 Encrypted Profile Data
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          {/* Background Detail */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
            <User size={240} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Full Name */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2">
                Legal Entity / Full Name
              </label>
              <div className="relative group/field">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/field:text-yellow-500 transition" size={18} />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 pl-14 text-sm font-bold outline-none focus:border-yellow-500/50 transition shadow-inner placeholder:text-gray-800"
                  placeholder="Verification ID Required"
                />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-700 tracking-[0.3em] ml-2">
                Master Log-in String (Static)
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                <input
                  type="email"
                  readOnly
                  value={profile.email}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl p-5 pl-14 text-sm font-mono text-gray-600 cursor-not-allowed italic"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2">
                Secure Mobile Link
              </label>
              <div className="relative group/field">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/field:text-yellow-500 transition" size={18} />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 pl-14 text-sm font-bold outline-none focus:border-yellow-500/50 transition placeholder:text-gray-800"
                  placeholder="+000 000 0000"
                />
              </div>
            </div>

            {/* Persistence Layer (Action Buttons) */}
            <div className={`pt-6 transition-all duration-500 ${hasChanges ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div className="flex gap-4 p-2 bg-yellow-500/5 border border-yellow-500/10 rounded-[2rem]">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition active:scale-95"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-[2] bg-white text-black hover:bg-yellow-500 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {updating ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <><Save size={16} /> Sync Profile Identity</>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* System Disclaimer */}
        <p className="text-center text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] px-10 leading-loose">
          Verification data is strictly regulated under Trustra 2026 Privacy Protocols. Profile updates undergo immediate ledger validation.
        </p>
      </div>
    </div>
  );
}
