// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || loading) return;

    setLoading(true);
    const toastId = toast.loading('Establishing secure encrypted session...');

    try {
      const result = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (result?.success) {
        toast.success('Access Granted. Welcome back.', { id: toastId });
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 600);
      }
    } catch (err) {
      console.error('Login Error:', err);

      let message = 'Invalid credentials';

      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }

      // Better user feedback
      if (message.toLowerCase().includes('verify') || message.toLowerCase().includes('email not verified')) {
        toast.error("Please verify your email address before logging in.", { id: toastId });
      } else {
        toast.error(message, { id: toastId });
      }

      setErrors({ auth: message });
      setFormData(prev => ({ ...prev, password: '' })); // Clear password on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">

        {/* Branding */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto"
          >
            <Zap className="text-emerald-500" size={34} />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Trustra <span className="text-emerald-500">Capital</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[2px] text-gray-500">
            Institutional Crypto Investment Platform
          </p>
        </div>

        {/* Global Error */}
        {errors.auth && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-950/70 border border-red-500/30 rounded-2xl p-4 flex gap-3 text-red-400 text-sm"
          >
            <AlertCircle size={22} className="shrink-0 mt-0.5" />
            <span>{errors.auth}</span>
          </motion.div>
        )}

        {/* Login Card */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                Security Identity (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-12 pr-4 py-4 bg-black/50 border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all ${
                    errors.email ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                Access Token (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-12 pr-12 py-4 bg-black/50 border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all ${
                    errors.password ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password}</p>}
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgotpassword"
                className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors"
              >
                Recover Access
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 bg-white hover:bg-emerald-500 active:bg-emerald-600 text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  AUTHORIZING SESSION...
                </>
              ) : (
                <>
                  AUTHORIZE SESSION
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-white/5">
            <Link
              to="/register"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              New to Trustra Capital? <span className="text-emerald-500 font-semibold">Apply for an Account</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
