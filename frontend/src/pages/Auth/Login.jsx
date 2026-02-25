import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useBtcPrice } from '../../hooks/useBtcPrice';
import api, { login as loginApi } from '../../api/api'; // ✅ Import login function
import { Mail, Lock, ChevronRight, Activity } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordRef = useRef(null);
  const { login } = useAuth();

  const btcPrice = useBtcPrice(60000);
  const formattedPrice = btcPrice
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(btcPrice)
    : 'SYNCHRONIZING...';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return toast.error('Credentials required');

    setIsSubmitting(true);
    try {
      // ✅ Use api.js login function
      const res = await loginApi(email.trim().toLowerCase(), password);

      const userData = res.user || res.data || res;
      const token = res.token;

      if (!userData || !token) throw new Error('Invalid server response: Missing user or token');

      login(userData, token); // AuthContext handles localStorage & navigation
      toast.success('Access Granted');
    } catch (err) {
      console.error('[Login Error]', err);
      setPassword('');
      passwordRef.current?.focus();

      const errorMsg = err.response?.data?.message || err.message || 'Authentication Failed';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center px-6 relative overflow-hidden">
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

      {/* Form */}
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

            {/* Redirect to Register */}
            <div className="text-center mt-6">
              <Link to="/register" className="text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                New investor? <span className="text-yellow-500 underline underline-offset-4">Create Account</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[8px] text-white/20 uppercase tracking-[0.5em] mt-8">
          Encrypted Node Connection • Zurich Hub v8.4.1
        </p>
      </div>
    </div>
  );
}
