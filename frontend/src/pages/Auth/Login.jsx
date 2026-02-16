import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { Mail, Lock, RefreshCw, ChevronRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [btcPrice, setBtcPrice] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ─── LIVE BTC PRICE ───
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur'
        );
        const data = await res.json();
        if (data?.bitcoin?.eur) setBtcPrice(data.bitcoin.eur);
      } catch (err) {
        console.error('Oracle offline', err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── LOGIN HANDLER ───
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return toast.error('Identification required');

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { user, token } = res.data;

      // 1. Update Global Auth State
      await login(user, token);

      // 2. Success Feedback
      toast.success('Access Granted');

      // 3. Strategic Redirection
      // We grab the path the user was TRYING to reach (e.g., /dashboard/withdraw)
      const destination = location.state?.from?.pathname || '/dashboard';
      
      // Small timeout ensures the AuthProvider's Reducer has finished 
      // flipping 'initialized' to true before the Router hits the Guard.
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 100);

    } catch (err) {
      console.error("Login Error:", err);
      const message = err.response?.data?.message || 'Invalid Credentials';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center px-6">
      {/* ... (Keep your existing UI JSX exactly as is) ... */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="w-16 h-16 bg-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-6 shadow-xl shadow-yellow-500/20">
          T
        </div>
        <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">Trustra Capital</h2>
        <p className="text-slate-500 text-[9px] uppercase tracking-[0.4em] font-bold mt-3">
          Network Status:{' '}
          {btcPrice ? (
            <span className="text-yellow-500 font-mono">BTC @ €{btcPrice.toLocaleString()}</span>
          ) : (
            <span className="animate-pulse text-slate-700 font-mono">SYNCHRONIZING...</span>
          )}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl shadow-3xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                autoFocus
                placeholder="investor@trustra.com"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white outline-none focus:border-yellow-600 transition-all placeholder:text-slate-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white outline-none focus:border-yellow-600 transition-all placeholder:text-slate-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-yellow-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} /> Verifying...
                </>
              ) : (
                <>
                  Secure Access <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-8">
            <Link
              to="/register"
              className="text-yellow-600 text-xs font-black uppercase tracking-widest hover:text-yellow-500 transition-colors"
            >
              Initialize New Node
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

