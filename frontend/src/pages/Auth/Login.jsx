import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../api'; // Using your fixed axios instance
import { TrendingUp, Mail, Lock, RefreshCw, ChevronRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [btcPrice, setBtcPrice] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 📈 LIVE PRICE ORACLE (Fixed Endpoint)
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Updated to the actual API endpoint
        const res = await fetch(
          'https://api.coingecko.com'
        );
        const data = await res.json();
        if (data?.bitcoin?.eur) {
          setBtcPrice(data.bitcoin.eur);
        }
      } catch (err) {
        console.error("Price oracle synchronization failed", err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return toast.error('Identification required');

    setLoading(true);
    try {
      // 1. Path must be /auth/login to match backend: app.use('/api/auth', authRoutes)
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      const { user, token } = res.data;

      // 2. AuthContext Update
      await login(user, token);

      toast.success('Protocol Authorized');
      
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      // CRITICAL: Reset loading state so user can retry
      setLoading(false);
      const message = err.response?.data?.message || 'Access Denied: Invalid Credentials';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-6 shadow-2xl shadow-yellow-500/20">
          T
        </div>
        <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">Trustra Capital</h2>
        <p className="text-slate-500 text-[9px] uppercase tracking-[0.4em] font-bold mt-3">
          Network Status: {btcPrice ? (
            <span className="text-yellow-500 font-mono">BTC @ €{btcPrice.toLocaleString()}</span>
          ) : (
            <span className="animate-pulse text-slate-700">SYNCHRONIZING...</span>
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
                placeholder="investor@trustra.com"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white outline-none focus:border-yellow-600 transition-all placeholder:text-slate-700 font-medium"
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
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white outline-none focus:border-yellow-600 transition-all placeholder:text-slate-700 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black hover:bg-yellow-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <><RefreshCw className="animate-spin" size={18} /> Verifying...</>
                ) : (
                  <>Secure Access <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-10 text-center">
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-white/20">No account?</span>
              <Link to="/register" className="text-yellow-600 font-black hover:text-yellow-500 transition-colors underline underline-offset-4">
                Register Node
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-[9px] text-white/20 uppercase tracking-[0.4em] font-bold">
            Audit Certified Protocol v8.4.1
        </div>
      </div>
    </div>
  );
}

