import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { Mail, Lock, RefreshCw, ChevronRight } from 'lucide-react';

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────

const BTC_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur';
const BTC_POLL_INTERVAL = 60_000; // 60s — safer for free tier
const SAFE_REDIRECT_PATTERN = /^\/(dashboard|portfolio|settings|profile)/;

// ──────────────────────────────────────────────
// HOOKS
// ──────────────────────────────────────────────

/**
 * Fetches live BTC/EUR price with abort-safe polling.
 */
function useBtcPrice(intervalMs = BTC_POLL_INTERVAL) {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPrice = async () => {
      try {
        const res = await fetch(BTC_PRICE_URL, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.bitcoin?.eur) setPrice(data.bitcoin.eur);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('BTC price fetch failed:', err.message);
        }
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, intervalMs);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [intervalMs]);

  return price;
}

// ──────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const btcPrice = useBtcPrice();

  // ── Redirect if already logged in ──
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // ── Memoized price display ──
  const formattedPrice = useMemo(() => {
    if (!btcPrice) return null;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(btcPrice);
  }, [btcPrice]);

  // ── Safe redirect target ──
  const getRedirectPath = useCallback(() => {
    const from = location.state?.from?.pathname;
    if (from && SAFE_REDIRECT_PATTERN.test(from)) return from;
    return '/dashboard';
  }, [location.state]);

  // ── Login handler ──
  const handleLogin = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return toast.error('Email and password are required');
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: trimmedEmail,
        password
      });

      const { user, token } = res.data;

      if (!user || !token) {
        throw new Error('Invalid server response');
      }

      // Clear password from state BEFORE async login
      setPassword('');

      await login(user, token);

      toast.success('Access granted');
      navigate(getRedirectPath(), { replace: true });
    } catch (err) {
      // Clear password on failure too
      setPassword('');

      const message =
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials';

      toast.error(message);

      // Refocus password field for quick retry
      passwordRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center px-6">
      {/* ── Header ── */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div
          className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-6 shadow-2xl shadow-yellow-500/20"
          aria-hidden="true"
        >
          T
        </div>
        <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter">
          Trustra Capital
        </h1>
        <p
          className="text-slate-500 text-xs uppercase tracking-[0.4em] font-bold mt-3"
          aria-live="polite"
        >
          Network Status:{' '}
          {formattedPrice ? (
            <span className="text-yellow-500 font-mono">BTC @ {formattedPrice}</span>
          ) : (
            <span className="animate-pulse text-slate-700 font-mono">
              Synchronizing...
            </span>
          )}
        </p>
      </div>

      {/* ── Form Card ── */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/[0.01] p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-3xl">
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            {/* Email */}
            <div className="relative group">
              <Mail
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors"
                size={18}
                aria-hidden="true"
              />
              <label htmlFor="login-email" className="sr-only">
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="investor@trustra.com"
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 transition-all placeholder:text-slate-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors"
                size={18}
                aria-hidden="true"
              />
              <label htmlFor="login-password" className="sr-only">
                Password
              </label>
              <input
                ref={passwordRef}
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 transition-all placeholder:text-slate-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:text-yellow-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-yellow-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} aria-hidden="true" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Secure Access</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-8">
            <Link
              to="/register"
              className="text-yellow-600 text-[10px] font-black uppercase tracking-widest hover:text-yellow-500 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
