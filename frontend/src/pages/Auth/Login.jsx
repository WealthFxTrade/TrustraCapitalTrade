import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock, Mail, Zap, Loader2, Eye, EyeOff,
  ArrowRight, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Wake up backend on mount
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        await api.get('/health');
        console.log("📡 Gateway Pulse: Active");
      } catch (err) {
        console.warn("⏳ Gateway Pulse: Waking up from sleep mode...");
      }
    };
    wakeUpServer();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Please enter all credentials.");
    }

    setLoading(true);
    const loadingToast = toast.loading("Verifying Identity...");

    try {
      await login(email, password);
      toast.success("Access Granted.", { id: loadingToast });
      navigate('/dashboard');
    } catch (err) {
      console.error("Login failed:", err);

      let errorMsg = "Login failed. Please try again.";

      if (!err.response) {
        // Network / cold start / refused connection
        errorMsg = "Terminal Securing... Gateway is waking up. Please try again in 10 seconds.";
      } else if (err.response.status === 401) {
        errorMsg = "Invalid Access Cipher. Access Denied.";
      } else {
        // Show the actual backend message (this fixes the vague "Protocol Mismatch")
        errorMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          `Server error (${err.response?.status || 'unknown'}). Please check your details.`;
      }

      toast.error(errorMsg, {
        id: loadingToast,
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-4 md:p-6 font-sans selection:bg-yellow-500/30 overflow-y-auto">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-yellow-500/5 blur-[80px] md:blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-md space-y-6 md:space-y-8 py-10">
        {/* Branding */}
        <div className="text-center space-y-3 md:space-y-4">
          <div
            className="inline-flex p-3 md:p-4 bg-yellow-500/10 rounded-2xl md:rounded-3xl border border-yellow-500/20 shadow-2xl cursor-pointer hover:bg-yellow-500/20 transition-all"
            onClick={() => navigate('/')}
          >
            <Zap className="text-yellow-500" size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">System Access</h1>
          <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] md:tracking-[0.4em]">
            Trustra Capital Trade • Secure Terminal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#0a0c10]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-3xl relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6" noValidate>
            {/* Protocol Email */}
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Protocol Email</label>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-yellow-500 transition-colors" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl py-3.5 md:py-4 pl-12 pr-6 text-sm focus:border-yellow-500/50 outline-none transition-all placeholder:text-gray-800"
                  placeholder="e.g., trader@trustra-capital.trade"
                  required
                />
              </div>
            </div>

            {/* Access Cipher */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] md:text-[10px] font-black text-gray-600 uppercase tracking-widest">Access Cipher</label>
                <Link to="/forgot-password" className="text-[8px] md:text-[9px] font-bold text-gray-700 hover:text-yellow-500 uppercase tracking-tighter transition-colors">Reset Key?</Link>
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-yellow-500 transition-colors" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl py-3.5 md:py-4 pl-12 pr-12 text-sm focus:border-yellow-500/50 outline-none transition-all placeholder:text-gray-800 font-mono"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 md:py-5 bg-yellow-500 hover:bg-white text-black font-black rounded-xl md:rounded-2xl uppercase tracking-[0.2em] text-[10px] md:text-[11px] flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Authenticate <ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-8 md:mt-10 text-center border-t border-white/5 pt-6 md:pt-8">
            <Link to="/register" className="text-[9px] md:text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[0.15em] transition-all">
              New Allocation Hub? <span className="text-yellow-500 underline decoration-2 underline-offset-4 ml-1">Sign Up</span>
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 md:gap-3 opacity-30">
          <ShieldCheck size={14} />
          <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em]">AES-256 Multi-Layer Encryption</p>
        </div>
      </div>
    </div>
  );
}
