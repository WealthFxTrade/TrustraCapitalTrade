import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Lock, 
  Camera, 
  ChevronRight, 
  Loader2,
  Globe,
  Fingerprint
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api, { API_ENDPOINTS } from '../../constants/api';

export default function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    username: '',
    kycStatus: 'unverified',
    tier: 'Starter'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch Profile on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);
        setProfile(data.user);
      } catch (err) {
        toast.error("Failed to synchronize profile data");
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(API_ENDPOINTS.USER.UPDATE, { name: profile.name });
      toast.success("Identity Record Updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    try {
      await api.put(`${API_ENDPOINTS.USER.UPDATE}/password`, passwordData);
      toast.success("Security Credentials Rotated Successfully");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password Update Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* ── PROFILE HEADER ── */}
      <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <Fingerprint size={120} className="text-emerald-500" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-900 p-1">
              <div className="w-full h-full rounded-full bg-[#06080c] flex items-center justify-center overflow-hidden">
                <User size={48} className="text-emerald-500/50" />
              </div>
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white text-black rounded-full hover:bg-emerald-500 transition-colors shadow-xl">
              <Camera size={16} />
            </button>
          </div>

          <div className="text-center md:text-left space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white">
              {profile.name} <span className="text-emerald-500">/ Node</span>
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                Tier: {profile.tier || 'Starter'}
              </span>
              <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                profile.kycStatus === 'verified' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                KYC: {profile.kycStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ── PERSONAL INFORMATION ── */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-10 space-y-8">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 italic flex items-center gap-2">
            <Globe size={14} /> Identity Registry
          </h3>
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-2">Full Name</label>
              <input 
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-emerald-500/50 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-2 opacity-50 cursor-not-allowed">
              <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-2">Email Address (Locked)</label>
              <div className="relative">
                <input type="email" value={profile.email} readOnly className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-gray-500 outline-none" />
                <Lock className="absolute right-5 top-4 text-gray-700" size={16} />
              </div>
            </div>
            <button disabled={loading} className="w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Save Changes"}
            </button>
          </form>
        </div>

        {/* ── SECURITY CREDENTIALS ── */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-10 space-y-8">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 italic flex items-center gap-2">
            <ShieldCheck size={14} /> Access Protocol
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <input 
              type="password" 
              placeholder="CURRENT PASSWORD"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-xs tracking-widest outline-none focus:border-emerald-500/50"
            />
            <input 
              type="password" 
              placeholder="NEW PASSWORD"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-xs tracking-widest outline-none focus:border-emerald-500/50"
            />
            <input 
              type="password" 
              placeholder="CONFIRM NEW PASSWORD"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-xs tracking-widest outline-none focus:border-emerald-500/50"
            />
            <button disabled={loading} className="w-full bg-emerald-500 text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all">
              Update Security
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
