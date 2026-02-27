// src/pages/Auth/Login.jsx
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useBtcPrice } from '../../hooks/useBtcPrice';
import { login as loginApi } from '../../api/api'; 
import { Mail, Lock, ChevronRight, Activity, Shield } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordRef = useRef(null);
  const { login: contextLogin } = useAuth();

  const btcPrice = useBtcPrice(60000);
  const formattedPrice = btcPrice
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(btcPrice)
    : 'SYNCHRONIZING...';

  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      return toast.error('Email and password are required');
    }

    setIsSubmitting(true);
    try {
      const res = await loginApi(trimmedEmail.toLowerCase(), password);
      const userData = res.user || res.data || res;
      const token = res.token || res.accessToken;

      if (!userData || !token) {
        throw new Error('Invalid response: missing user or token');
      }

      contextLogin(userData, token);
      toast.success('Access Granted – Redirecting...');
    } catch (err) {
      console.error('[Login Error]', err);
      setPassword('');
      passwordRef.current?.focus();
      const errorMsg = err.response?.data?.message || err.message || 'Authentication failed.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center px-6 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full -z-10" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-6 shadow-2xl shadow-yellow-500/20">
          T
        </div>
        <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter">Investor Login</h1>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-black mt-3 flex items-center justify-center gap-2">
          <Activity size={12} className="text-green-500 animate-pulse" />
          Network Status: <span className="text-yellow-500">BTC @ {formattedPrice}</span>
        </p>
      </div>

      {/* Form Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-3xl relative overflow-hidden">
          <form onSubmit={handleLogin} className="relative z-10 space-y-5">
            {/* Email Input */}
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="INVESTOR@TRUSTRA.COM"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase tracking-widest transition-all placeholder:text-slate-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                ref={passwordRef}
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black hover:bg-yellow-500 disabled:bg-slate-800 disabled:text-slate-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              <span>{isSubmitting ? 'AUTHENTICATING...' : 'AUTHENTICATE ACCESS'}</span>
              {!isSubmitting && <ChevronRight size={14} />}
            </button>
          </form>

          {/* Footer Actions */}
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4 text-center">
            <Link to="/register" className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.2em] hover:text-yellow-400 transition-colors">
              Establish New Portfolio
            </Link>
            <Link to="/forgot-password" size={14} className="text-[9px] font-bold uppercase text-slate-600 hover:text-slate-400">
              Encryption Recovery
            </Link>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-10 flex items-center justify-center gap-3 text-slate-700">
          <Shield size={16} />
          <p className="text-[9px] font-black uppercase tracking-[0.3em]">
            Secure Node Connection: AES-256 Enabled
          </p>
        </div>
      </div>
    </div>
  );
}

