import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated, initialized } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, initialized, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreed) {
      toast.error('You must accept the terms and risk disclosure');
      return;
    }

    setLoading(true);

    try {
      await signup(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.phone.trim()
      );

      toast.success('Account created successfully. Welcome to Trustra Capital Trade.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Full debug logging to browser console
      console.error('Signup attempt failed:', {
        message: err.message,
        status: err.response?.status,
        responseData: err.response?.data,
        networkError: !err.response && !!err.request,
        fullError: err.toString(),
      });

      let message = 'Unable to create account. Please try again.';

      if (err.response?.data?.message) {
        // Use exact message from backend when available
        message = err.response.data.message;
      } else if (err.response) {
        // Classify based on HTTP status
        const status = err.response.status;

        if (status === 400) {
          message = 'Please check the information you entered.';
        } else if (status === 401 || status === 403) {
          message = 'Authentication issue. Please try again.';
        } else if (status === 409 || status === 422) {
          message = 'This email or username is already registered.';
        } else if (status === 429) {
          message = 'Too many attempts. Please wait a moment.';
        } else if (status >= 500) {
          message = 'Service is temporarily unavailable. Please try again shortly.';
        } else {
          message = `Server error (${status})`;
        }
      } else if (err.request) {
        // No response received (network failure, timeout, aborted, offline, etc.)
        message = 'Cannot reach the server. Please check your internet connection.';
      } else {
        // Generic JavaScript error
        message = err.message || 'An unexpected error occurred.';
      }

      toast.error(message, {
        duration: 6500,
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020408] to-[#0a0c14] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 mb-6 shadow-xl shadow-yellow-500/5">
            <ShieldCheck className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Create <span className="text-yellow-500">Account</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500 font-medium tracking-wide uppercase">
            Trustra Capital Trade • Secure Trading Platform
          </p>
        </div>

        <div className="bg-[#0f111a]/90 backdrop-blur-sm border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#1a1d2e] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#1a1d2e] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  pattern="\+?[0-9\s\-\(\)]{8,20}"
                  required
                  autoComplete="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#1a1d2e] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Include country code (e.g. +1, +44, +234, +91)
              </p>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#1a1d2e] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-[#1a1d2e] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className="mt-1 w-5 h-5 bg-[#1a1d2e] border-white/20 rounded accent-yellow-500 cursor-pointer focus:ring-yellow-500/30"
              />
              <label htmlFor="terms" className="text-sm text-gray-400 leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" className="text-yellow-500 hover:text-yellow-400 underline underline-offset-2">
                  Terms of Service
                </Link>{' '}
                and confirm that I have read the{' '}
                <Link to="/risk-disclosure" className="text-yellow-500 hover:text-yellow-400 underline underline-offset-2">
                  Risk Disclosure
                </Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-4 px-6 font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-lg ${
                loading
                  ? 'bg-yellow-600/70 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-black shadow-yellow-500/20 hover:shadow-yellow-500/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-yellow-500 font-semibold hover:text-yellow-400 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
