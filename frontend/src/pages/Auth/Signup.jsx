import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap, User, Mail, Lock, ShieldCheck,
  ArrowRight, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/api';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Wake up backend on mount
  useEffect(() => {
    api.get('/health').catch(() => {
      console.log("⏳ Initializing Gateway...");
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    if (!trimmedName) return toast.error("Investor name is required.");
    if (!formData.email.trim()) return toast.error("Protocol email is required.");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Please enter a valid email address.");
    if (!formData.password) return toast.error("Access cipher is required.");
    if (formData.password.length < 8) return toast.error("Access cipher must be at least 8 characters long.");

    setLoading(true);
    const loadId = toast.loading("Initializing Allocation Hub...");

    try {
      await signup(formData.email, formData.password, trimmedName);
      toast.success("Account Protocol Created. Redirecting...", { id: loadId });
      navigate('/dashboard');
    } catch (err) {
      console.error("Signup error:", err);

      let errorMessage = "Failed to initialize protocol. Please try again later.";

      if (!err.response) {
        errorMessage = "Cannot reach the server. It may be starting up, offline, or your network is unstable. Wait 15–30 seconds and retry.";
      } else if (err.response.status === 409 || err.response.data?.message?.toLowerCase().includes('exists') || err.response.data?.message?.toLowerCase().includes('already')) {
        errorMessage = "This email is already registered. Please sign in or use a different email.";
      } else if (err.response.status === 504 || err.response.status === 502 || err.response.status === 503) {
        errorMessage = "Server timeout (possible cold start). Retry in a moment.";
      } else if (err.response.status === 400 || err.response.status === 422) {
        errorMessage = err.response.data?.message || "Invalid input. Check your details.";
      } else if (err.response.status >= 500) {
        errorMessage = "Internal server error. Please try again later.";
      } else {
        errorMessage = err.response.data?.message || "Protocol initialization failed.";
      }

      toast.error(errorMessage, { id: loadId, duration: 8000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-4 md:p-6 font-sans overflow-y-auto selection:bg-yellow-500/30">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-yellow-500/5 blur-[80px] md:blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-md space-y-6 md:space-y-8 py-10">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 mb-2">
            <Zap className="text-yellow-500" size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">New Allocation</h1>
          <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] md:tracking-[0.4em]">
            Initialize Protocol • Trustra Capital Trade
          </p>
        </div>

        <div className="bg-[#0a0c10]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Investor Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  required
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-800"
                  placeholder="e.g., Trustra Investor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Protocol Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  required
                  type="email"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-800"
                  placeholder="e.g., trader@trustra-capital.trade"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Access Cipher</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  required
                  type="password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-800 font-mono"
                  placeholder="Secure Quantum Key"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 md:py-5 bg-yellow-500 hover:bg-white text-black font-black rounded-xl md:rounded-2xl uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Initialize Hub <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <Link to="/login" className="text-[9px] font-black text-gray-600 hover:text-white uppercase tracking-[0.15em] transition-all">
              Already Registered? <span className="text-yellow-500 underline decoration-2 underline-offset-4 ml-1">Sign In</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 opacity-30">
          <ShieldCheck size={14} />
          <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em]">AES-256 Secure Enrollment • Trustra Capital Trade</p>
        </div>
      </div>
    </div>
  );
}
