import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { 
  User, ShieldCheck, Lock, Key, 
  Mail, Fingerprint, Loader2, AlertCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setLoading(true);
    try {
      await api.put('/user/update-password', passwords);
      toast.success("Security Credentials Updated");
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol Update Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <Fingerprint className="text-yellow-500" /> Node <span className="text-yellow-500">Settings</span>
        </h1>
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mt-2">Manage your Digital Identity & Security</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0a0f1e] border border-white/5 p-8 rounded-[2.5rem]">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 mb-6">
              <User size={32} />
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-1">Full Legal Name</label>
                <p className="text-sm font-bold text-white">{user?.fullName || 'Not Provided'}</p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-1">Registered Email</label>
                <div className="flex items-center gap-2 text-sm font-mono text-gray-400">
                  <Mail size={12} /> {user?.email}
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className={user?.kycStatus === 'verified' ? 'text-emerald-500' : 'text-yellow-500'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {user?.kycStatus === 'verified' ? 'Node Verified' : 'Audit Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-3">
            <AlertCircle size={18} className="text-yellow-500 shrink-0" />
            <p className="text-[9px] text-gray-500 uppercase font-black italic leading-relaxed">
              Email changes require administrative manual override for security purposes.
            </p>
          </div>
        </div>

        {/* Right Column: Security Update */}
        <div className="lg:col-span-2">
          <div className="bg-[#0a0f1e] border border-white/5 p-8 md:p-10 rounded-[2.5rem]">
            <h2 className="text-xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3">
              <Lock className="text-yellow-500" /> Update <span className="text-yellow-500">Security Node</span>
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-2">Current Access Key</label>
                <input 
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-yellow-500/30 transition-all text-white"
                  placeholder="••••••••••••"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-2">New Access Key</label>
                  <input 
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-yellow-500/30 transition-all text-white"
                    placeholder="New Password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-2">Confirm New Key</label>
                  <input 
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-yellow-500/30 transition-all text-white"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-[0.3em] rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Key size={20} />}
                Commence Password Reset
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
