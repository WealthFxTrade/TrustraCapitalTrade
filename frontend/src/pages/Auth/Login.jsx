import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
// Assuming useBtcPrice is a custom hook you've created
import { useBtcPrice } from '../../hooks/useBtcPrice'; 
import api from '../../api/api';
import { Mail, Lock, ChevronRight, Activity } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordRef = useRef(null);

  const { login } = useAuth();

  // Price Oracle logic
  const btcPrice = useBtcPrice(60000); 
  const formattedPrice = btcPrice
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(btcPrice)
    : 'SYNCHRONIZING...';

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      return toast.error('Credentials required');
    }

    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      // Safely extract user and token from nested response
      const userData = res.data.user || res.data.data || res.data;
      const token = res.data.token;

      if (!userData || !token) {
        throw new Error('Invalid server response: Missing user or token');
      }

      // login() in AuthContext handles: 
      // 1. localStorage.setItem
      // 2. State update
      // 3. navigate('/dashboard')
      login(userData, token); 
      
      toast.success('Access Granted');
    } catch (err) {
      console.error('[Login Error]', err);
      setPassword('');
      passwordRef.current?.focus();
      
      const errorMsg = err.response?.data?.message || 'Authentication Failed';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full -z-10" />

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

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-3xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                type="email"
                required
                placeholder="INVESTOR@TRUSTRA.COM"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase tracking-widest transition-all"
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
              <span>{isSubmitting ? 'Authenticating...' : 'Authenticate Access'}</span>
              {!isSubmitting && <ChevronRight size={14} />}
            </button>

            {/* Redirect to Register (Updated Path) */}
            <div className="text-center mt-6">
              <Link to="/register" className="text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                New investor? <span className="text-yellow-500 underline underline-offset-4">Create Account</span>
              </Link>
            </div>
          </form>
        </div>
        
        {/* Security Footer */}
        <p className="text-center text-[8px] text-white/20 uppercase tracking-[0.5em] mt-8">
          Encrypted Node Connection • Zurich Hub v8.4.1
        </p>
      </div>
    </div>
  );
}

