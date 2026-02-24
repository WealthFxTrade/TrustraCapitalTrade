import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useBtcPrice } from '../../hooks/useBtcPrice';
import api from '../../api/api';
import { Mail, Lock, ChevronRight } from 'lucide-react';

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────
const SAFE_REDIRECT_PATTERN = /^\/(dashboard|portfolio|settings|profile)/;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef(null);

  const { login, user, initialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const btcPrice = useBtcPrice();

  // ── Redirect if already logged in ──
  useEffect(() => {
    if (initialized && user) {
      const from = location.state?.from?.pathname;
      const target = (from && SAFE_REDIRECT_PATTERN.test(from)) ? from : '/dashboard';
      navigate(target, { replace: true });
    }
  }, [user, initialized, navigate, location.state]);

  const formattedPrice = useMemo(() => {
    if (!btcPrice) return null;
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(btcPrice);
  }, [btcPrice]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) return toast.error('Email and password are required');

    try {
      // API call triggers nProgress via interceptor automatically
      const res = await api.post('/auth/login', { email: trimmedEmail, password });
      
      const userData = res.data.user || res.data.data;
      const token = res.data.token;

      if (!userData || !token) throw new Error('Invalid server response');

      // Clear local password for security
      setPassword(''); 

      // Update Global Auth State
      login(userData, token);
      toast.success('Access granted');
    } catch (err) {
      // Local cleanup only. Global api.js interceptor handles the error toast.
      setPassword('');
      passwordRef.current?.focus();
    }
  };

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-6 shadow-2xl shadow-yellow-500/20">
          T
        </div>
        <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter">Trustra Capital</h1>
        <p className="text-slate-500 text-xs uppercase tracking-[0.4em] font-bold mt-3">
          Network Status: {formattedPrice ? (
            <span className="text-yellow-500 font-mono">BTC @ {formattedPrice}</span>
          ) : (
            <span className="animate-pulse text-slate-700 font-mono">Synchronizing...</span>
          )}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/[0.01] p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-3xl">
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                id="login-email"
                type="email"
                placeholder="INVESTOR@TRUSTRA.COM"
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 transition-all placeholder:text-slate-700 text-[10px] font-black uppercase tracking-widest"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                ref={passwordRef}
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 transition-all placeholder:text-slate-700 text-[10px] font-black uppercase tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center px-1">
              <Link to="/signup" className="text-slate-600 text-[8px] font-bold uppercase tracking-[0.2em] hover:text-white transition-colors">
                New Investor? <span className="text-yellow-500">Join</span>
              </Link>
              <Link to="/forgot-password" size="xs" className="text-slate-600 text-[8px] font-bold uppercase tracking-[0.2em] hover:text-yellow-500 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black hover:bg-yellow-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <span>Authenticate Access</span>
              <ChevronRight size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
