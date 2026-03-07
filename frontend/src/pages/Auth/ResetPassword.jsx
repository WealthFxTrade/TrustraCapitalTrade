import React, { useState } from 'react';
import { Key, Hash, Loader2, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { state } = useLocation(); // Get email passed from previous page
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    email: state?.email || ''
  });
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/reset-password', formData);
      toast.success(data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset Denied");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020408] p-6">
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-10 rounded-[2.5rem]">
        <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter mb-8 text-center">Update Access Cipher</h2>
        
        <form onSubmit={handleReset} className="space-y-6">
          {/* OTP INPUT */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">6-Digit Auth Code</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input 
                type="text" maxLength="6" required
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white font-mono tracking-[0.5em] text-center"
                onChange={(e) => setFormData({...formData, otp: e.target.value})}
              />
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">New Security Cipher</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input 
                type="password" required
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-yellow-500"
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-emerald-500 hover:bg-white text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 italic uppercase"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} /> Confirm Reset</>}
          </button>
        </form>
      </div>
    </div>
  );
}
