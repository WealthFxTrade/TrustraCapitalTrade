// src/pages/Auth/ResetPassword.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Key, Hash, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { state } = useLocation(); // email passed from ForgotPassword
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: state?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: '', color: '' };
    if (pwd.length < 8) return { strength: 'Weak', color: 'text-rose-400' };
    if (pwd.length < 12 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { strength: 'Medium', color: 'text-yellow-400' };
    return { strength: 'Strong', color: 'text-emerald-400' };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.otp.trim()) {
      newErrors.otp = '6-digit code is required';
    } else if (!/^\d{6}$/.test(formData.otp.trim())) {
      newErrors.otp = 'OTP must be exactly 6 digits';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Resetting access cipher...');

    try {
      const payload = {
        email: formData.email.trim(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword.trim(),
      };

      const { data } = await api.put('/auth/reset-password', payload);

      toast.success(data.message || 'Cipher successfully reset. Please sign in.', {
        id: toastId,
        duration: 6000,
      });

      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.status === 400 ? 'Invalid or expired reset code' :
        err.response?.status === 404 ? 'Email not found' :
        'Reset failed. Please try again or request a new code.';
      toast.error(msg, { id: toastId, duration: 6000 });
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 shadow-lg shadow-emerald-900/10">
            <Key className="text-emerald-500" size={40} />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Reset <span className="text-emerald-500">Access Cipher</span>
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Enter your 6-digit code and new password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0a0c10]/90 backdrop-blur-2xl border border-white/8 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/5 to-transparent pointer-events-none" />

          {errors.general && (
            <div className="bg-rose-900/20 border border-rose-700/40 p-5 rounded-2xl mb-8 flex items-start gap-3">
              <AlertCircle size={20} className="text-rose-500 shrink-0 mt-1" />
              <p className="text-sm text-rose-300">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Email (Read-only) */}
            <div className="space-y-2 opacity-70">
              <label htmlFor="email" className="text-xs font-black uppercase text-gray-500 tracking-[0.25em] ml-1 block">
                Node Email (Locked)
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm font-mono text-gray-500 cursor-not-allowed outline-none"
                  title="Email from recovery request"
                />
              </div>
            </div>

            {/* OTP Field */}
            <div className="space-y-2">
              <label htmlFor="otp" className="text-xs font-black uppercase text-gray-500 tracking-[0.25em] ml-1 block">
                6-Digit Auth Code *
              </label>
              <div className="relative group">
                <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                  id="otp"
                  type="text"
                  name="otp"
                  maxLength={6}
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  aria-invalid={!!errors.otp}
                  aria-describedby={errors.otp ? 'otp-error' : undefined}
                  className={`w-full bg-black/50 border ${errors.otp ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-emerald-500/50'} rounded-2xl py-4 pl-14 pr-4 outline-none transition-all font-mono text-center text-xl tracking-[0.5em] disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="------"
                />
              </div>
              {errors.otp && (
                <p id="otp-error" className="text-rose-400 text-xs mt-1 ml-2">
                  {errors.otp}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-xs font-black uppercase text-gray-500 tracking-[0.25em] ml-1 block">
                New Security Cipher *
              </label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  aria-invalid={!!errors.newPassword}
                  aria-describedby={errors.newPassword ? 'password-error' : undefined}
                  className={`w-full bg-black/50 border ${errors.newPassword ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-emerald-500/50'} rounded-2xl py-4 pl-14 pr-12 outline-none transition-all font-medium placeholder:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword ? (
                <p id="password-error" className="text-rose-400 text-xs mt-1 ml-2">
                  {errors.newPassword}
                </p>
              ) : formData.newPassword && (
                <p className={`text-xs mt-1 ml-2 ${pwStrength.color}`}>
                  Cipher strength: {pwStrength.strength}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-xs font-black uppercase text-gray-500 tracking-[0.25em] ml-1 block">
                Confirm New Cipher *
              </label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                  className={`w-full bg-black/50 border ${errors.confirmPassword ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-emerald-500/50'} rounded-2xl py-4 pl-14 pr-12 outline-none transition-all font-medium placeholder:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white focus:outline-none transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirmation' : 'Show confirmation'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-error" className="text-rose-400 text-xs mt-1 ml-2">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black uppercase text-base tracking-wider flex items-center justify-center gap-3 transition-all shadow-xl ${
                loading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Resetting Cipher...
                </>
              ) : (
                <>
                  Confirm Reset
                  <CheckCircle size={20} />
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center mt-6">
              <Link
                to="/login"
                className="text-yellow-500 hover:text-yellow-400 font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight size={16} className="rotate-180" /> Back to Sign In
              </Link>
            </div>
          </form>

          {/* Footer Security Note */}
          <div className="mt-10 text-center text-[10px] text-gray-600 uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Secure Reset • AES-256 Protected • Zurich Vault</span>
          </div>
        </div>
      </div>
    </div>
  );
}
