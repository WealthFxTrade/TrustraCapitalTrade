// src/pages/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      toast.error('Please correct the email field');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Verifying node identity...');

    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim() });

      toast.success(data.message || 'Recovery instructions sent to your email', {
        id: toastId,
        duration: 8000,
      });

      // Optional: navigate to a confirmation page or back to login
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.status === 404 ? 'No account found with this email' :
        'Failed to send recovery email. Please try again later.';
      toast.error(msg, { id: toastId, duration: 6000 });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-yellow-500/10 rounded-3xl border border-yellow-500/20 shadow-lg shadow-yellow-900/10">
            <ShieldCheck className="text-yellow-500" size={40} />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Recover <span className="text-yellow-500">Node Access</span>
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Enter your node email to receive recovery instructions
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0a0c10]/90 backdrop-blur-2xl border border-white/8 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/5 to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Email Field */}
            <div className="space-y-3">
              <label htmlFor="email" className="text-xs font-black uppercase text-gray-500 tracking-[0.25em] ml-1 block">
                Node Email Identifier *
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="node@trustra.capital"
                  required
                  disabled={loading}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'email-error' : undefined}
                  className={`w-full bg-black/50 border ${error ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-yellow-500/50'} rounded-2xl py-4 pl-14 pr-4 outline-none transition-all font-medium placeholder:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
              {error && (
                <p id="email-error" className="text-rose-400 text-xs mt-1 ml-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {error}
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
                  : 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sending Recovery Instructions...
                </>
              ) : (
                <>
                  Request Recovery Link
                  <ArrowRight size={20} />
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

          {/* Footer Info */}
          <div className="mt-10 text-center text-sm text-gray-500 space-y-2">
            <p>Check your spam/junk folder if the email doesn't arrive within 5 minutes.</p>
            <p className="text-[10px] uppercase tracking-widest opacity-70">
              Secure Recovery • AES-256 Encrypted • Zurich Vault Node
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
