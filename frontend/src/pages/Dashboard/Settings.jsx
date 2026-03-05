import React, { useState } from 'react';
import { 
  User, Lock, Bell, Shield, 
  Smartphone, Globe, Mail, Eye, 
  EyeOff, ChevronRight, Save, 
  AlertCircle, Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/api';

export default function Settings() {
  const { user, refreshAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    language: 'English (UK)',
    timezone: 'UTC +1 (Zurich)'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/user/update-profile', profileData);
      toast.success("Identity Node Updated");
      refreshAuth();
    } catch (err) {
      toast.error("Profile Synchronization Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 pt-28 font-sans selection:bg-yellow-500/30">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* ── HEADER ── */}
        <header>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            System <span className="text-yellow-500">Configuration</span>
          </h1>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-2">
            Node Parameters & Security Clearance
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* ── LEFT: NAVIGATION TABS ── */}
          <div className="lg:col-span-3 space-y-2">
            {[
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'security', icon: Lock, label: 'Security' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'privacy', icon: Shield, label: 'Privacy' }
            ].map((tab) => (
              <button 
                key={tab.id}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group hover:bg-white/5"
              >
                <tab.icon size={18} className="text-gray-500 group-hover:text-yellow-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── RIGHT: SETTINGS PANELS ── */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* PROFILE SECTION */}
            <section className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-yellow-500/60 mb-8 flex items-center gap-3">
                <User size={16} /> Identity Parameters
              </h3>
              
              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Full Legal Name</label>
                  <input 
                    type="text" 
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-yellow-500/30 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Email Node</label>
                  <input 
                    type="email" 
                    disabled
                    value={profileData.email}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-sm font-bold text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Interface Language</label>
                  <select className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-yellow-500/30 transition-all appearance-none">
                    <option>English (UK)</option>
                    <option>German (CH)</option>
                    <option>French (FR)</option>
                  </select>
                </div>
                <div className="space-y-3 flex items-end">
                  <button 
                    disabled={loading}
                    className="w-full py-5 bg-white text-black text-[10px] font-black uppercase rounded-2xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={14} /> : <><Save size={14} /> Save Profile</>}
                  </button>
                </div>
              </form>
            </section>

            {/* SECURITY SECTION */}
            <section className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                <Key size={180} />
              </div>
              
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-rose-500/60 mb-8 flex items-center gap-3">
                <Lock size={16} /> Encryption Key Rotation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">New Protocol Password</label>
                     <div className="relative">
                       <input 
                         type={showPassword ? "text" : "password"}
                         className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-rose-500/30 transition-all"
                       />
                       <button 
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                       >
                         {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                       </button>
                     </div>
                   </div>
                   <button className="w-full py-5 border border-white/10 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-rose-500 hover:border-rose-500 transition-all">
                     Update Password
                   </button>
                </div>

                <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-rose-500">
                    <AlertCircle size={20} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Two-Factor Auth (2FA)</h4>
                  </div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                    2FA adds a secondary layer of encryption. We strongly recommend enabling this for all capital extractions.
                  </p>
                  <button className="w-full py-4 bg-rose-500/20 text-rose-500 text-[9px] font-black uppercase rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                    Enable Authenticator
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
