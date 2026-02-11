// src/pages/Auth/Signup.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext'; // Fixed path
import api from '../../api/api';                     // Fixed path
import { TrendingUp, User, Mail, Lock, Phone, RefreshCw, Zap } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const fullNameRef = useRef(null);

  const selectedPlan = location.state?.selectedPlan || null;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

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

    const { fullName, email, phone, password, confirmPassword } = formData;

    // Validation
    if (!fullName.trim()) return toast.error('Full name is required');
    if (!email.includes('@')) return toast.error('Invalid email address');
    if (!phone.trim()) return toast.error('Phone number is required for SMS security');
    if (password.length < 8) return toast.error('Password too short');
    if (password !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password
      });

      const { user, token } = response.data;
      login(user, token);
      toast.success('Trustra Node Activated. Welcome!');

      navigate('/dashboard', { state: { autoOpenNode: selectedPlan }, replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="flex items-center gap-2 mb-8 group">
        <TrendingUp className="h-10 w-10 text-blue-500 group-hover:scale-110 transition-transform" />
        <span className="text-2xl font-black text-white tracking-tighter italic uppercase">Trustra</span>
      </Link>

      <div className="w-full max-w-md bg-slate-900/40 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2 uppercase italic">Register</h2>
          {selectedPlan ? (
            <div className="flex items-center justify-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 py-2 rounded-lg">
              <Zap size={12} /> Initializing {selectedPlan}
            </div>
          ) : (
            <p className="text-slate-400 text-sm font-medium">Join 2016's most secure investment node</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              name="fullName"
              ref={fullNameRef}
              placeholder="Full Name"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              name="phone"
              placeholder="Phone (with country code)"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="password"
              name="password"
              placeholder="Create Password"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all font-mono"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all font-mono"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${
              loading
                ? 'bg-blue-600/50 text-slate-300'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20'
            }`}
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500 text-xs font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>

      <div className="mt-12 text-center opacity-50">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em] italic">
          © 2016–2026 Trustra Capital Trade
        </p>
      </div>
    </div>
  );
}
