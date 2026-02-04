import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/api'; // Use our unified axios instance

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Unified change handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // 1. Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      return toast.error('All fields are required');
    }
    if (formData.password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      /**
       * 2. The API Call
       * Since our axios instance already has /api and the base URL,
       * we only need the relative endpoint.
       */
      const response = await api.post('/auth/register', formData);

      // 3. Success Handling
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      /**
       * 4. Error Handling
       * Our axios interceptor already normalized this, 
       * so err.message is safe to display directly.
       */
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 selection:bg-indigo-500/30">
      {/* Brand Logo Header */}
      <Link to="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition">
        <TrendingUp className="h-10 w-10 text-indigo-500" />
        <span className="text-2xl font-bold text-white tracking-tight">TrustraCapital</span>
      </Link>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

        <h1 className="text-3xl font-bold text-white mb-2 text-center">Create Account</h1>
        <p className="text-slate-400 text-center text-sm mb-8">Join the future of automated trading</p>

        <form onSubmit={handleSignup} className="space-y-5">
          {/* Full Name Input */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              required
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="password"
              name="password"
              placeholder="Password (min 8 chars)"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-bold text-lg transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? 'Creating Account...' : 'Register & Start Investing'}
          </button>
        </form>

        <p className="text-slate-500 text-center mt-8 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-bold hover:underline">
            Login here
          </Link>
        </p>

        {/* Security Footer Badge */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-center items-center gap-2 text-slate-600">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">AES-256 Secured Registration</span>
        </div>
      </div>
    </div>
  );
}

