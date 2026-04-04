// src/pages/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Mail, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  CheckCircle,
  KeyRound 
} from 'lucide-react';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    const toastId = toast.loading('Sending recovery email...');

    try {
      const result = await forgotPassword(email.trim());

      if (result.success) {
        toast.success('Recovery email sent!', { id: toastId });
        setSubmitted(true);
      } else {
        toast.error(result.message || 'Failed to send recovery email', { id: toastId });
        setError(result.message || 'Failed to send recovery email');
      }
    } catch (err) {
      toast.error('Network error. Please try again.', { id: toastId });
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 selection:bg-emerald-500 selection:text-black">
      <div className="w-full max-w-md space-y-8">
        
        {/* Back Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition-colors text-sm font-bold"
        >
          <ArrowLeft size={18} />
          Back to Sign In
        </Link>

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
            Password <span className="text-emerald-500">Recovery</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Secure Account Recovery Protocol
          </p>
        </div>

        {/* Form Card */}
        <div className="relative bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
          
          {submitted ? (
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
                <h2 className="text-xl font-black text-white mb-2">Recovery Email Sent</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  If an account exists with <span className="text-emerald-500">{email}</span>, 
                  you will receive a password reset link shortly.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-500 text-xs">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="text-emerald-500 hover:text-emerald-400 text-sm font-bold underline"
                >
                  Try another email
                </button>
              </div>
            </motion.div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-gray-400 text-sm text-center mb-6">
                Enter your registered email address and we'll send you a secure link to reset your password.
              </p>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className={`w-full pl-12 pr-4 py-4 bg-black/40 border ${
                      error ? 'border-rose-500' : 'border-white/5'
                    } rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder-gray-600`}
                    placeholder="investor@example.com"
                  />
                </div>
                {error && (
                  <p className="text-rose-500 text-xs ml-1">{error}</p>
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
                    Sending...
                  </span>
                ) : (
                  'Send Recovery Link'
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
