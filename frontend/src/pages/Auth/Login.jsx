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

  // 🛰️ Gateway Pulse: Wake up backend on mount
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        // Points to your corrected health check route
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
      // ✅ LOGIC FIX: Ensure the login function matches your AuthContext
      await login(email, password);
      toast.success("Access Granted.", { id: loadingToast });
      
      // Small delay to allow the state to hydrate before navigation
      setTimeout(() => navigate('/dashboard'), 100);
    } catch (err) {
      console.error("Login failed:", err);
      
      let errorMsg = "Login failed. Please try again.";
      
      if (!err.response) {
        errorMsg = "Gateway synchronization timeout. Please retry in 10s.";
      } else if (err.response.status === 401) {
        errorMsg = "Invalid Access Cipher. Access Denied.";
      } else {
        errorMsg = err.response?.data?.message || "Protocol Mismatch Detected.";
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
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-4 font-sans selection:bg-yellow-500/30 overflow-y-auto">
      {/* Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-yellow-500/[0.03] blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="w-full max-w-md space-y-8 py-12 relative z-10">
        {/* Branding */}
        <div className="text-center space-y-4">
          <div 
            className="inline-flex p-4 bg-yellow-500/10 rounded-3xl border border-yellow-500/20 shadow-2xl cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <Zap className="text-yellow-500 fill-current" size={32} />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">System Access</h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
            Trustra Capital Trade • Secure Terminal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#0a0c10]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Protocol Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Protocol Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-yellow-500/50 outline-none transition-all placeholder:text-gray-800"
                  placeholder="trader@trustra-capital.trade"
                  required
                />
              </div>
            </div>

            {/* Access Cipher */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Access Cipher</label>
                <Link to="/forgot-password" size={14} className="text-[9px] font-bold text-gray-700 hover:text-yellow-500 uppercase transition-colors">Reset Key?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm focus:border-yellow-500/50 outline-none transition-all placeholder:text-gray-800 font-mono"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-yellow-500 hover:bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Authenticate <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-10 text-center border-t border-white/5 pt-8">
            <Link to="/register" className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[0.15em] transition-all">
              New Allocation Hub? <span className="text-yellow-500 underline decoration-2 underline-offset-4 ml-1">Sign Up</span>
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-3 opacity-30">
          <ShieldCheck size={14} className="text-yellow-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.5em]">AES-256 Multi-Layer Encryption</p>
        </div>
      </div>
    </div>
  );
}
