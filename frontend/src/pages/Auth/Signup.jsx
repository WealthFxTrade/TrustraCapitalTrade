import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../api'; // Your fixed axios instance
import { TrendingUp, Mail, Lock, User, Phone, RefreshCw, ChevronRight, ShieldCheck } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [btcPrice, setBtcPrice] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 📈 LIVE PRICE ORACLE (Fixed Endpoint)
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com'
        );
        const data = await res.json();
        if (data?.bitcoin?.eur) setBtcPrice(data.bitcoin.eur);
      } catch (err) {
        console.error("Market oracle sync failed");
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 1. Validation Logic
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Cryptography mismatch: Passwords do not match');
    }
    if (formData.password.length < 8) {
      return toast.error('Security Protocol: Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      // 2. PATH FIX: Must be /auth/register to match backend app.use('/api/auth', authRoutes)
      const res = await api.post('/auth/register', {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password
      });

      const { user, token } = res.data;

      // 3. Commit to AuthContext
      await login(user, token);

      toast.success('Node Synchronized: Welcome to Trustra');
      
      // Navigate to Dashboard to see newly derived BTC address
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // CRITICAL: Reset loading state on error
      setLoading(false);
      const message = err.response?.data?.message || 'Registration Protocol Failed';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center py-12 px-6 selection:bg-yellow-500/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-6 shadow-2xl shadow-yellow-500/20">
          T
        </div>
        <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">Initialize Node</h2>
        <p className="text-slate-500 text-[9px] uppercase tracking-[0.4em] font-bold mt-3">
          Market Status: {btcPrice ? (
            <span className="text-yellow-500 font-mono">BTC @ €{btcPrice.toLocaleString()}</span>
          ) : (
            <span className="animate-pulse text-slate-700">SYNCHRONIZING...</span>
          )}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl shadow-3xl">
          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                name="fullName"
                placeholder="Full Legal Name"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600 transition-all placeholder:text-slate-700 text-sm"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                name="email"
                placeholder="investor@email.com"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600 transition-all placeholder:text-slate-700 text-sm"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                name="phone"
                placeholder="+1 (555) 000-0000"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600 transition-all placeholder:text-slate-700 text-sm"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                name="password"
                placeholder="Create Secure Password"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600 transition-all placeholder:text-slate-700 text-sm"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600 transition-all placeholder:text-slate-700 text-sm"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black hover:bg-yellow-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <><RefreshCw className="animate-spin" size={18} /> Initializing Node...</>
                ) : (
                  <>Create Account <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center border-t border-white/5 pt-8">
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-white/20">Already verified?</span>
              <Link to="/login" className="text-yellow-600 font-black hover:text-yellow-500 transition-colors underline underline-offset-4">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

