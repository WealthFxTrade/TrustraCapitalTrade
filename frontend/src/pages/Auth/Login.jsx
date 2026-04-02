import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Zap, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Pre-filled with requested existing user credentials
  const [formData, setFormData] = useState({ 
    email: 'Gery.maes1@telenet.be', 
    password: '' 
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Node identity required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid identity format';

    if (!formData.password) errs.password = 'Access key required';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return toast.error('Security validation failed');

    setLoading(true);
    const toastId = toast.loading('Decrypting Node Access...');

    try {
      // Logic adjusted to handle the login response correctly
      const res = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (res && res.success) {
        toast.success('Access Granted. Initializing Terminal...', { id: toastId });
        setTimeout(() => navigate('/dashboard', { replace: true }), 600);
      } else {
        // Specifically addressing the "Invalid Credentials" feedback
        toast.error(res?.message || 'Invalid Credentials. Access Denied.', { id: toastId });
        setErrors({ auth: 'Authentication failed. Please verify your credentials.' });
      }
    } catch (err) {
      toast.error('System Timeout. Connection to node failed.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 selection:bg-emerald-500 selection:text-black">
      <div className="w-full max-w-md space-y-8">
        
        {/* Institutional Header */}
        <div className="text-center space-y-3">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Zap className="text-emerald-500" size={32} />
          </motion.div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Trustra <span className="text-emerald-500">Node</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Secure access to your capital terminal
          </p>
        </div>

        {/* Status Message for Errors */}
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

        <div className="relative bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-black/40 border ${
                    errors.email ? 'border-rose-500' : 'border-white/5'
                  } rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all`}
                  placeholder="node@trustracapital.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-4 bg-black/40 border ${
                    errors.password ? 'border-rose-500' : 'border-white/5'
                  } rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all`}
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-emerald-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
                <input type="checkbox" className="accent-emerald-500 rounded border-white/5 bg-black" />
                Remember Node
              </label>
              <Link to="/forgot-password" size={14} className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all ${
                loading
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/10'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Corrected Register Link */}
          <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-500 hover:underline">
              Create one now
            </Link>
          </p>
        </div>

        {/* Footer Audit */}
        <div className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 pt-4">
          <ShieldCheck className="inline mr-2 text-emerald-500/40" size={14} /> 
          End-to-End Encrypted • AES-256 Protocol
        </div>
      </div>
    </div>
  );
}

