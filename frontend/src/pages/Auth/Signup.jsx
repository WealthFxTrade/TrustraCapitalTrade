import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/api.js';
import { TrendingUp, User, Mail, Lock, RefreshCw } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fullNameRef = useRef(null);

  // Auto-focus Full Name input on mount
  useEffect(() => {
    fullNameRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const { fullName, email, password, confirmPassword } = formData;

    // Client-side validation
    if (!fullName.trim() || fullName.trim().length < 2)
      return toast.error('Please enter a valid full name');

    if (!email.trim())
      return toast.error('Email is required');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return toast.error('Please enter a valid email address');

    if (password.length < 8)
      return toast.error('Password must be at least 8 characters');

    if (password !== confirmPassword)
      return toast.error('Passwords do not match');

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim(),
        password
      });

      const { user, token } = response.data;

      // Log in immediately
      login(user, token);
      toast.success('Account created successfully! Welcome aboard.');

      // Smart redirect
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8 group">
        <TrendingUp className="h-10 w-10 text-blue-500 group-hover:scale-110 transition-transform" />
        <span className="text-2xl font-black text-white tracking-tighter italic uppercase">Trustra</span>
      </Link>

      {/* Form container */}
      <div className="w-full max-w-md bg-slate-900/40 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2 uppercase italic">Register</h2>
          <p className="text-slate-400 text-sm font-medium">Join 2016's most secure investment node</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              name="fullName"
              ref={fullNameRef}
              placeholder="Full Name"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all disabled:opacity-60"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all disabled:opacity-60"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="password"
              name="password"
              placeholder="Create Password"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all font-mono disabled:opacity-60"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all font-mono disabled:opacity-60"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 transition-all ${
              loading
                ? 'bg-blue-600/50 text-slate-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-700/30 text-white'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={18} /> Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500 text-xs font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 font-bold hover:underline transition-colors">
            Sign In here
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center opacity-50">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em] italic mb-2">
          © 2016–2026 Trustra Capital Trade
        </p>
        <p className="text-[8px] text-slate-700 max-w-xs mx-auto">
          Digital asset investments involve significant risk. Trustra operates under 2026 Asset Security Directives.
        </p>
      </div>
    </div>
  );
}
