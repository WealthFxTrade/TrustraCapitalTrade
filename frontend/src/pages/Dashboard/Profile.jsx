// frontend/src/pages/Dashboard/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, Save, Lock, Eye, EyeOff,
  Loader2, ShieldCheck, CheckCircle2, Upload, X, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

export default function Profile({ refreshSession }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        password: '',
        confirmPassword: '',
      });
      if (user.avatar) setAvatarPreview(user.avatar);
    }
  }, [user]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Only image files are supported');
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB for performance');

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (profile.password && profile.password.length  ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed', { id: tid });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header with Dynamic KYC Status */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
            Identity <span className="text-emerald-500">Vault</span>
          </h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-3 flex items-center gap-2">
            <ShieldCheck size={12} className="text-emerald-500" />
            Authenticated as {user?.role} • Node Index {user?.address_index}
          </p>
        </div>
        
        {/* Dynamic KYC Badge */}
        <div className={`px-5 py-2 border rounded-full flex items-center gap-2 ${
            user?.kycStatus === 'verified' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}>
          {user?.kycStatus === 'verified' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span className="text-[10px] font-black uppercase tracking-widest">
            KYC {user?.kycStatus || 'unverified'}
          </span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-[#0a0c10] border border-white/10 p-5 pl-14 rounded-2xl focus:border-emerald-500 outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full bg-[#0a0c10] border border-white/10 p-5 pl-14 rounded-2xl focus:border-emerald-500 outline-none transition-all font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 opacity-60">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Registered Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full bg-[#0a0c10] border border-white/5 p-5 pl-14 rounded-2xl cursor-not-allowed font-bold"
              />
            </div>
          </div>

          <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Lock size={14} className="text-emerald-500" /> Security Override
            </h4>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password to change"
                value={profile.password}
                onChange={(e) => setProfile({...profile, password: e.target.value})}
                className="w-full bg-black border border-white/10 p-5 rounded-2xl focus:border-emerald-500 outline-none transition-all font-mono"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            disabled={updating}
            className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {updating ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Commit Profile Changes
          </button>
        </div>

        {/* Avatar Upload */}
        <div className="lg:col-span-5">
           <div className="p-8 bg-[#0a0c10] border border-white/10 rounded-[40px] flex flex-col items-center text-center">
              <div className="relative w-40 h-40 mb-8">
                <div className="w-full h-full rounded-full border-4 border-emerald-500/20 overflow-hidden bg-black flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={60} className="text-gray-800" />
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-2 right-2 p-3 bg-white text-black rounded-full shadow-xl hover:scale-110 transition-transform"
                >
                  <Upload size={18} />
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleFile(e.target.files[0])} 
                className="hidden" 
                accept="image/*"
              />
              <h4 className="font-bold text-white mb-2">Institutional Avatar</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest max-w-[200px]">
                JPG or PNG. Max size 2MB. Recommended 400x400px.
              </p>
           </div>
        </div>
      </form>
    </div>
  );
}

