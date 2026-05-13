// src/pages/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  // Get redirect path from location state (ProtectedRoute/AdminRoute)
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '', auth: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email';
    if (!formData.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const toastId = toast.loading('Establishing secure session...');

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password,
        remember: rememberMe,
      });

      if (result.success) {
        toast.success('Access Granted. Welcome back.', { id: toastId });
        // Redirect to intended page (dashboard or admin)
        setTimeout(() => navigate(from, { replace: true }), 800);
      } else {
        toast.error(result.message || 'Invalid credentials', { id: toastId });
        setErrors({ auth: result.message || 'Invalid email or password' });
      }
    } catch (err) {
      toast.error('Connection failed', { id: toastId });
      setErrors({ auth: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md space-y-8">

        {/* Branding */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Zap className="text-emerald-500" size={32} />
          </motion.div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Trustra <span className="text-emerald-500">Capital</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Institutional Crypto Investment Platform
          </p>
        </div>

        {errors.auth && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-sm"
          >
            <AlertCircle size={20} />
            {errors.auth}
          </motion.div>
        )}

        <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                Security Identity (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-12 pr-4 py-4 bg-black/40 border rounded-2xl text-sm font-bold text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 ${
                    errors.email ? 'border-rose-500' : 'border-white/5'
                  }`}
                  placeholder="investor@trustra.com"
                />
              </div>
              {errors.email && <p className="text-rose-500 text-xs ml-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                Access Token (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-12 pr-12 py-4 bg-black/40 border rounded-2xl text-sm font-bold text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 ${
                    errors.password ? 'border-rose-500' : 'border-white/5'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-emerald-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-xs ml-1">{errors.password}</p>}
            </div>

            {/* Trust Device + Recover */}
            <div className="flex items-center justify-between px-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  disabled={loading}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  rememberMe ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                }`}>
                  {rememberMe && <span className="text-black text-xs">✓</span>}
                </div>
                <span className="font-black uppercase tracking-widest text-gray-500">Trust Device</span>
              </label>

              <Link to="/forgot-password" className="text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-widest">
                Recover Access
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white hover:bg-emerald-500 active:bg-emerald-600 text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-70 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  AUTHORIZING...
                </>
              ) : (
                <>
                  Authorize Session
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-gray-600">
          New to Trustra Capital?{' '}
          <Link to="/register" className="text-white font-black hover:text-emerald-500">
            Apply for an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
