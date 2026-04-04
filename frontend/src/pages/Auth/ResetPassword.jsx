// src/pages/Auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck, 
  CheckCircle,
  AlertCircle,
  KeyRound 
} from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setErrors({ token: 'Invalid or missing reset token' });
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const toastId = toast.loading('Resetting password...');

    try {
      const result = await resetPassword(token, formData.password);

      if (result.success) {
        toast.success('Password reset successful!', { id: toastId });
        setSuccess(true);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      } else {
        toast.error(result.message || 'Password reset failed', { id: toastId });
        setErrors({ submit: result.message || 'Password reset failed' });
      }
    } catch (err) {
      toast.error('Network error. Please try again.', { id: toastId });
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 selection:bg-emerald-500 selection:text-black">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <KeyRound className="text-emerald-500" size={32} />
          </motion.div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Reset <span className="text-emerald-500">Password</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Create a New Secure Password
          </p>
        </div>

        {/* Form Card */}
        <div className="relative bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
          
          {errors.token ? (
            // Invalid Token State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="text-rose-500" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white mb-2">Invalid Reset Link</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>
              <Link
                to="/auth/forgot-password"
                className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black uppercase text-xs tracking-wider transition-all"
              >
                Request New Link
              </Link>
            </motion.div>
          ) : success ? (
            // Success State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-emerald-500" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white mb-2">Password Reset Complete</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your password has been successfully reset. Redirecting you to sign in...
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={24} />
              </div>
            </motion.div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-gray-400 text-sm text-center mb-6">
                Enter your new password below. Make sure it's at least 8 characters long.
              </p>

              {/* Error Alert */}
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-xs font-bold"
                >
                  <AlertCircle size={18} />
                  {errors.submit}
                </motion.div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                  New Password
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
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-rose-500 text-xs ml-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 bg-black/40 border ${
                      errors.confirmPassword ? 'border-rose-500' : 'border-white/5'
                    } rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder-gray-600`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-emerald-500 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-rose-500 text-xs ml-1">{errors.confirmPassword}</p>
                )}
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
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security Footer */}
        <div className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 pt-4">
          <ShieldCheck className="inline mr-2 text-emerald-500/40" size={14} />
          End-to-End Encrypted • AES-256 Protocol
        </div>
      </div>
    </div>
  );
}
