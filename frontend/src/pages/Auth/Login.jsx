import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return toast.error("Identity and Cipher required.");

    setLoading(true);
    const loadId = toast.loading("Authenticating Cipher...");

    try {
      await login(formData.email.trim(), formData.password);
      toast.success("Access Granted.", { id: loadId });
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid Identity or Cipher.";
      toast.error(msg, { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 mb-2">
            <Zap className="text-yellow-500 fill-current" size={24} />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Terminal Access</h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Sign In • Trustra Capital</p>
        </div>

        <div className="bg-[#0a0c10]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 block">Protocol Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  required
                  type="email"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 block">Access Cipher</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  required
                  type="password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 font-mono"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* 🔘 Updated Button Label */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-yellow-500 hover:bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Login <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <Link to="/signup" className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[0.15em]">
              New Investor? <span className="text-yellow-500 underline underline-offset-4 ml-1 italic">Create Account</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 opacity-30">
          <ShieldCheck size={14} className="text-yellow-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.5em]">AES-256 Secure Terminal</p>
        </div>
      </div>
    </div>
  );
}
