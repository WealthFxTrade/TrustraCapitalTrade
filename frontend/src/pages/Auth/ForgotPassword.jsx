// src/pages/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowLeft, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setSuccess(true);
        toast.success(result.message);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      const msg = 'Unable to send reset link. Please try again.';
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
          <h1 className="text-3xl font-black tracking-tighter">Forgot Password</h1>
          <p className="text-gray-400 text-sm mt-2">Reset your account password</p>
        </div>

        {/* Main Card */}
        <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-10 shadow-2xl">
          {success ? (
            /* Success State */
            <div className="text-center py-8">
              <CheckCircle size={64} className="mx-auto text-emerald-500 mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Reset Link Sent</h3>
              <p className="text-gray-400 mb-8">
                We've sent password reset instructions to <strong>{email}</strong>.<br />
                Please check your inbox (and spam folder).
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-semibold py-4 rounded-2xl transition-all"
              >
                Return to Login
              </button>
            </div>
          ) : (
            /* Form State */
            <>
              <p className="text-gray-400 text-center mb-8">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-400 text-sm">
                  <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-white/10 rounded-2xl px-12 py-4 focus:border-emerald-500 outline-none transition-all font-mono"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/30 disabled:text-emerald-900/50 text-black font-black uppercase tracking-widest py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
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
            <ArrowLeft size={16} />
            Back to Login
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
