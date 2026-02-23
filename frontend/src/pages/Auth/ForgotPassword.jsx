// src/pages/Auth/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/api'; // FIXED PATH
import { Mail, RefreshCw } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your email');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      toast.success('Password reset link sent to your email');
      setEmail('');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset link';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col justify-center px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black uppercase italic text-white">Forgot Password</h2>
        <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">
          Enter your email to reset your password
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition-colors duration-200 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs space-y-3">
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 transition-colors block"
            >
              Back to Login
            </Link>
          </div>
        </div>

        <p className="mt-10 text-center text-[9px] font-bold text-slate-700 uppercase tracking-widest">
          © 2016–2026 Trustra Capital Trade • SSL Encrypted
        </p>
      </div>
    </div>
  );
}
