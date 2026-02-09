import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx'; // adjust path if needed
import api from '../api/api.js';
import { TrendingUp, Mail, Lock, RefreshCw, ChevronRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // ← important: to redirect back after login

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      return toast.error('Please enter email and password');
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      const { user, token } = response.data;

      // Call context login (which should handle localStorage + state)
      login(user, token);

      toast.success('Access Granted');

      // Smart redirect: go back to where user came from (if protected route sent them here)
      // otherwise default to dashboard or plans
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      // Better error handling — show backend message when available
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col justify-center px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="flex justify-center mb-6">
          <TrendingUp className="h-10 w-10 text-blue-500" />
        </div>
        <h2 className="text-3xl font-black uppercase italic">Sign In</h2>
        <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">
          Secure Portfolio Access
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                type="email"
                placeholder="investor@trustra.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition-colors duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition-colors duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 transition-all duration-200 ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-blue-700/30'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Authenticating...
                </>
              ) : (
                <>
                  Login
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs space-y-3">
            <Link
              to="/forgot-password"
              className="text-blue-400 hover:text-blue-300 transition-colors block"
            >
              Forgot password?
            </Link>

            <p className="text-slate-500">
              No account?{' '}
              <Link
                to="/register"
                className="text-white font-bold hover:text-blue-400 transition-colors underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-[9px] font-bold text-slate-700 uppercase tracking-widest">
          © 2016–2026 Trustra Capital Trade • SSL Encrypted
        </p>
      </div>
    </div>
  );
}
