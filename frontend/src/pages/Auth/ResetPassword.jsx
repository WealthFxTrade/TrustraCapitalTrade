// src/pages/Auth/ResetPassword.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, formData.password);

      if (result.success) {
        setSuccess(true);
        toast.success(result.message || 'Password reset successful!');
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      const msg = 'Password reset failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-4 md:p-10 font-sans relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div
            className="flex items-center gap-3 cursor-pointer mb-6 group"
            onClick={() => navigate('/')}
          >
            <ShieldCheck className="text-emerald-500 transition-transform group-hover:scale-110" size={48} />
            <div>
              <span className="text-3xl font-black tracking-tighter uppercase block">TRUSTRA</span>
              <span className="text-xs font-bold text-emerald-500 tracking-[0.25em]">CAPITAL TRADE</span>
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">Reset Password</h1>
          <p className="text-gray-400 text-sm mt-2">Create a new secure password</p>
        </div>

        {/* Main Card */}
        <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-10 shadow-2xl">
          {success ? (
            /* Success State */
            <div className="text-center py-8">
              <CheckCircle size={64} className="mx-auto text-emerald-500 mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Password Reset Successful</h3>
              <p className="text-gray-400 mb-8">
                Your password has been updated successfully.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-semibold py-4 rounded-2xl transition-all"
              >
                Go to Login
              </button>
            </div>
          ) : (
            /* Form State */
            <>
              {!token && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm flex items-start gap-3">
                  <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                  <div>Invalid or expired reset link. Please request a new one.</div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-400 text-sm">
                  <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full bg-black/60 border border-white/10 rounded-2xl px-12 py-4 focus:border-emerald-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 block">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 focus:border-emerald-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/30 disabled:text-emerald-900/50 text-black font-black uppercase tracking-widest py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      Reset Password <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Login
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-[10px] text-gray-600">
          © 2026 Trustra Capital Trade • Simulation & Analytics Platform
          <br />
          Capital at risk • Not financial advice
        </div>
      </motion.div>
    </div>
  );
}
