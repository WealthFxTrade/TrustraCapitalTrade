import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { TrendingUp, Mail, Lock, RefreshCw, ChevronRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [btcPrice, setBtcPrice] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // FIX: Accurate CoinGecko endpoint for BTC/EUR tracking
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com'
        );
        const data = await res.json();
        // Access nested data: data.bitcoin.eur
        if (data?.bitcoin?.eur) {
          setBtcPrice(data.bitcoin.eur);
        }
      } catch (err) {
        console.error("Price oracle failed", err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Sync every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return toast.error('Enter credentials');

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      const { user, token } = res.data;

      // Ensure login context is updated before navigating
      await login(user, token);
      
      toast.success('Access Granted');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      // FIX: Reset loading state so the user can try again
      setLoading(false);
      const message = err.response?.data?.message || 'Invalid credentials';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col justify-center px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">Trustra Capital</h2>
        <p className="text-slate-500 text-[9px] uppercase tracking-[0.3em] font-bold mt-2">
          BTC/EUR: {btcPrice ? (
            <span className="text-blue-400 font-mono">€{btcPrice.toLocaleString()}</span>
          ) : (
            <span className="animate-pulse text-slate-700">SYNCING...</span>
          )}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email"
                name="email"
                placeholder="investor@trustra.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20"
            >
              {loading ? (
                <><RefreshCw className="animate-spin" size={18} /> Authenticating...</>
              ) : (
                <>Login <ChevronRight size={16} /></>
              )}
            </button>
          </form>
          <div className="mt-8 text-center text-[10px] uppercase tracking-widest text-slate-500">
            No account? <Link to="/register" className="text-white font-black hover:text-blue-400 transition-colors underline">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

