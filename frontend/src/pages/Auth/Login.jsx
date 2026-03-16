// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error('Both email and password are required.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const toastId = toast.loading('Authenticating Node...');

    try {
      const credentials = {
        email: formData.email.trim(),
        password: formData.password.trim(),
      };

      console.log('[LOGIN] Attempting login with:', credentials.email);

      const result = await login(credentials);

      console.log('[LOGIN RESULT]', result); // Debug: see exact return value

      if (result?.success) {
        console.log('[LOGIN] Success – navigating to /dashboard');
        toast.success('Access Granted', { id: toastId });
        // Force navigation with delay to ensure toast shows
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500); // 500ms delay prevents toast disappearance
      } else {
        console.warn('[LOGIN] Result missing success flag', result);
        throw new Error('Login returned unsuccessful result');
      }
    } catch (error) {
      console.error('[LOGIN FULL ERROR]', error); // Debug: full error details

      let errorMessage = 'Handshake failed. Please check your credentials.';

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;

        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.status === 403) {
          errorMessage = 'Access denied (account restricted)';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error – please try again later';
        } else if (error.response.status === 0) {
          errorMessage = 'Connection failed – backend offline or proxy issue';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Check backend status.';
      } else {
        errorMessage = error.message || errorMessage;
      }

      toast.error(errorMessage, { id: toastId, duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setFormData((previousData) => ({
      ...previousData,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header / Branding Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 mb-2">
            <Zap className="text-yellow-500 fill-current" size={32} />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Sign In
          </h1>
          <p className="text-sm text-gray-400">
            Access your Trustra Capital account
          </p>
        </div>

        {/* Main Card / Form Container */}
        <div className="bg-[#0a0c10]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1 block">
                Email
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors"
                  size={16}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-yellow-500/50 transition-all font-medium placeholder:text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1 block">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors"
                  size={16}
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-yellow-500/50 transition-all font-medium placeholder:text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 uppercase tracking-tighter"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Authenticating...
                </>
              ) : (
                <>
                  Initialize Session
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <Link to="/forgot-password" className="text-yellow-500 hover:text-yellow-400 transition-colors">
              Forgot password?
            </Link>
          </div>

          {/* Register Link */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500">
              New to the protocol?{' '}
              <Link to="/register" className="text-yellow-500 font-bold hover:text-yellow-400 transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
