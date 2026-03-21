// src/pages/Auth/Login.jsx
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
    const email = formData.email.trim();
    const password = formData.password.trim();
    if (!email || !password) {
      toast.error('Both email and password are required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const toastId = toast.loading('Authenticating Node...');

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password.trim(),
      });

      if (result.success) {
        toast.success('Node access granted', { id: toastId });
        setTimeout(() => navigate('/dashboard', { replace: true }), 500);
      } else {
        toast.error(result.message || 'Handshake failed', { id: toastId, duration: 6000 });
      }
    } catch (err) {
      toast.error('Unexpected login error', { id: toastId });
      console.error('[LOGIN ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 mb-2">
            <Zap className="text-yellow-500 fill-current" size={32} />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Node Sign-In</h1>
          <p className="text-sm text-gray-400">Access your Trustra Capital Node</p>
        </div>

        <div className="bg-[#0a0c10]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1 block">
                Node Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="identity@trustra.com"
                  required
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-yellow-500/50 transition-all font-medium placeholder:text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1 block">
                Node Cipher
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-yellow-500/50 transition-all font-medium placeholder:text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 uppercase tracking-tighter"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Authenticating Node...
                </>
              ) : (
                <>
                  Access Node
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <Link to="/forgot-password" className="text-yellow-500 hover:text-yellow-400">
              Forgot Node Cipher?
            </Link>
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 text-center text-sm text-gray-500">
            New to Trustra Capital?{' '}
            <Link to="/register" className="text-yellow-500 font-bold hover:text-yellow-400">
              Initialize Node
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
