// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '', auth: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    }
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
        remember: rememberMe // Pass remember me flag to AuthContext
      });

      if (result.success) {
        toast.success('Access Granted. Welcome back.', { id: toastId });
        // Smooth transition to dashboard
        setTimeout(() => navigate('/dashboard', { replace: true }), 800);
      } else {
        toast.error(result.message || 'Invalid credentials', { id: toastId });
        setErrors({ auth: result.message || 'Invalid email or password' });
      }
    } catch (err) {
      toast.error('Vault connection failed. Check your network.', { id: toastId });
      setErrors({ auth: 'Network error. Protocol synchronization failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 selection:bg-emerald-500 selection:text-black font-sans">
      <div className="w-full max-w-md space-y-8">
        
        {/* Institutional Branding */}
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

        {/* Error Feedback */}
        {errors.auth && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-xs font-bold"
          >
            <AlertCircle size={18} />
            {errors.auth}
          </motion.div>
        )}

        {/* Login Card */}
        <div className="relative bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
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
                  className={`w-full pl-12 pr-4 py-4 bg-black/40 border ${
                    errors.email ? 'border-rose-500' : 'border-white/5'
                  } rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder-gray-600`}
                  placeholder="investor@trustra.com"
                />
              </div>
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
                  className={`w-full pl-12 pr-12 py-4 bg-black/40 border ${
                    errors.password ? 'border-rose-500' : 'border-white/5'
                  } rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder-gray-600`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-emerald-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  rememberMe ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                }`}>
                  {rememberMe && <ShieldCheck className="text-black" size={10} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
                  Trust Device
                </span>
              </label>
              <Link to="/forgot-password" size={18} className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">
                Recover Access
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin text-black" size={18} />
              ) : (
                <>Authorize Session <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600 text-xs font-medium">
            New to Trustra Capital?{' '}
            <Link to="/register" className="text-white font-black hover:text-emerald-500 transition-colors underline underline-offset-4 decoration-emerald-500/30">
              Apply for an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Simple Helper for Button Icon
function ArrowRight({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

