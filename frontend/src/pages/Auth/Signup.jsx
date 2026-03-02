import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Zap, User, Mail, Lock, ShieldCheck, 
  ArrowRight, Loader2, Phone 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/api';

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

  // 🛰️ Gateway Pulse: Wake up backend on mount
  useEffect(() => {
    api.get('/health').catch(() => {
      console.log("⏳ Initializing Gateway...");
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();

    // Protocol Validations
    if (!trimmedName) return toast.error("Investor name is required.");
    if (!trimmedEmail) return toast.error("Protocol email is required.");
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) return toast.error("Invalid email structure.");
    if (!trimmedPhone) return toast.error("Phone Protocol is required for security.");
    if (!formData.password || formData.password.length < 8) {
      return toast.error("Access cipher must be at least 8 characters.");
    }

    setLoading(true);
    const loadId = toast.loading("Initializing Allocation Hub...");

    try {
      // ✅ SUCCESS: Passing name, email, password, AND phone
      await signup(trimmedEmail, formData.password, trimmedName, trimmedPhone);
      toast.success("Account Protocol Created. Redirecting...", { id: loadId });
      
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      console.error("Signup error:", err);
      let errorMessage = "Protocol initialization failed.";

      if (!err.response) {
        errorMessage = "Gateway sync timeout. Retry in 15s.";
      } else if (err.response.status === 409) {
        errorMessage = "Email already registered in the Trustra ledger.";
      } else {
        errorMessage = err.response.data?.message || "Internal Protocol Error.";
      }
      
      toast.error(errorMessage, { id: loadId, duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-4 md:p-6 font-sans overflow-y-auto selection:bg-yellow-500/30">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-yellow-500/[0.03] blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 md:space-y-8 py-10 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 mb-2">
            <Zap className="text-yellow-500 fill-current" size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">New Allocation</h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
            Initialize Protocol • Trustra Capital
          </p>
        </div>

        <div className="bg-[#0a0c10]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Investor Name */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 text-center block">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  required
                  type="text"
                  placeholder="e.g., Marcus Thorne"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Protocol Email */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 text-center block">Protocol Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  required
                  type="email"
                  placeholder="trader@trustra-capital.trade"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* ✅ NEW: Phone Number Protocol */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 text-center block">Phone Protocol</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  required
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 transition-all font-mono"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Access Cipher */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 text-center block">Access Cipher</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 transition-all font-mono"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-yellow-500 hover:bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Initialize Hub <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <Link to="/login" className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[0.15em] transition-all">
              Already Registered? <span className="text-yellow-500 underline decoration-2 underline-offset-4 ml-1 italic">Sign In</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 opacity-30">
          <ShieldCheck size={14} className="text-yellow-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.5em]">AES-256 Secure Enrollment</p>
        </div>
      </div>
    </div>
  );
}
