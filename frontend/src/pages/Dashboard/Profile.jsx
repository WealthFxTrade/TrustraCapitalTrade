import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, RefreshCw, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/api'; // Step up two levels
import { useAuth } from '../../context/AuthContext'; // Step up two levels
import { API_ENDPOINTS } from '../../constants/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [initialProfile, setInitialProfile] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      const currentData = {
        name: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      };
      setProfile(currentData);
      setInitialProfile(currentData);
    }
  }, [user]);

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
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
        setUser({ ...user, ...profile });
        setInitialProfile(profile);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const hasChanges =
    profile.name.trim() !== initialProfile.name?.trim() ||
    profile.phone.trim() !== initialProfile.phone?.trim();

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 font-sans selection:bg-yellow-500/30">
      <div className="max-w-xl mx-auto space-y-10">
        
        <header className="space-y-2">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-yellow-500 transition-colors mb-4"
          >
            <ChevronLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Identity <span className="text-yellow-500">Node</span>
          </h1>
        </header>

        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2">Full Legal Name</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition" size={18} />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 pl-14 text-sm font-bold outline-none focus:border-yellow-500/50 transition"
                  />
                </div>
              </div>

              <div className="space-y-2 opacity-50">
                <label className="text-[10px] font-black uppercase text-gray-700 tracking-[0.3em] ml-2">Email Identifier (Static)</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                  <input
                    type="email"
                    readOnly
                    value={profile.email}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl p-5 pl-14 text-sm font-mono text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2">Secure Phone Link</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition" size={18} />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 pl-14 text-sm font-bold outline-none focus:border-yellow-500/50 transition"
                  />
                </div>
              </div>
            </div>

            {hasChanges && (
              <div className="flex gap-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <button
                  type="button"
                  onClick={() => setProfile(initialProfile)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-500 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-[2] bg-white text-black hover:bg-yellow-500 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition flex items-center justify-center gap-2"
                >
                  {updating ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                  Sync Changes
                </button>
              </div>
            )}
          </form>
        </div>
        
        <div className="flex justify-center gap-2 opacity-30">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[8px] font-black uppercase tracking-[0.4em]">Protocol v8.4.1 Secure</span>
        </div>
      </div>
    </div>
  );
}
