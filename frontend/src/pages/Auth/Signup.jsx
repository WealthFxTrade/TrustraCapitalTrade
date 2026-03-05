import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, User, Mail, Lock, ShieldCheck, ArrowRight, Loader2, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone) {
      return toast.error("All protocol fields are required.");
    }
    if (formData.password.length < 8) {
      return toast.error("Access cipher must be at least 8 characters.");
    }

    setLoading(true);
    const loadId = toast.loading("Initializing Allocation Hub...");

    try {
      // ✅ Maps 'name' to 'username' inside AuthContext.signup
      await signup(trimmedEmail, formData.password, trimmedName, trimmedPhone);
      toast.success("Account Created successfully.", { id: loadId });
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      const msg = err.response?.data?.message || "Protocol Error: Check your connection.";
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
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">New Allocation</h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Initialize Protocol • Trustra Capital</p>
        </div>

        <div className="bg-[#0a0c10]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 block">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500" size={16} />
                <input
                  required
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 block">Protocol Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500" size={16} />
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
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 block">Phone Protocol</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500" size={16} />
                <input
                  required
                  type="tel"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 font-mono"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 block">Access Cipher</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500" size={16} />
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
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <Link to="/login" className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[0.15em]">
              Already Registered? <span className="text-yellow-500 underline underline-offset-4 ml-1 italic">Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
