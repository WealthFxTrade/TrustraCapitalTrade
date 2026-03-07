import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const trimmedEmail = formData.email.trim();

    if (!trimmedEmail || !formData.password) {
      toast.error('Email and password are required.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address.');
      return false;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const toastId = toast.loading('Signing you in...');

    try {
      await login(formData.email.trim(), formData.password);
      toast.success('Login successful!', { id: toastId });
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      let errorMsg = 'Invalid email or password. Please try again.';

      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message?.includes('network') || err.message?.includes('connect') || !err.response) {
        errorMsg = 'Connection issue — please check your internet and try again.';
      }

      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 mb-2">
            <Zap className="text-yellow-500 fill-current" size={24} />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Sign In</h1>
          <p className="text-sm text-gray-400">Access your Trustra Capital account</p>
        </div>

        <div className="bg-[#0a0c10]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1 block">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 transition-colors"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1 block">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 transition-colors font-mono"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-2xl uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all mt-6 disabled:opacity-60 shadow-lg shadow-yellow-500/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Login <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <Link to="/signup" className="text-sm text-gray-400 hover:text-white transition-colors">
              New here? <span className="text-yellow-500 font-semibold underline underline-offset-4">Create an account</span>
            </Link>
          </div>
        </div>

        {/* Removed suspicious "AES-256 Secure Terminal" footer */}
      </div>
    </div>
  );
}
