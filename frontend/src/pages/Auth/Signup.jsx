import { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api'; 
import { TrendingUp, User, Mail, Lock, Phone, RefreshCw, Zap, ChevronRight } from 'lucide-react';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, phone, password, confirmPassword } = formData;

    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 8) return toast.error('Password too short (Min 8)');

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password
      });

      const { user, token } = res.data;
      
      // Update Context & Storage
      await login(user, token);
      
      toast.success('Trustra Node Activated');
      navigate('/dashboard', { state: { autoOpenNode: selectedPlan }, replace: true });
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="flex items-center gap-2 mb-8 group">
        <TrendingUp className="h-10 w-10 text-blue-500 group-hover:scale-110 transition-transform" />
        <span className="text-2xl font-black text-white tracking-tighter italic uppercase">Trustra</span>
      </Link>

      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tight">Register</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Join the 2026 Audit Protocol</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
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
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
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
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
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
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 font-mono"
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
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 font-mono"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20"
          >
            {loading ? (
              <><RefreshCw className="animate-spin" size={18} /> Activating Node...</>
            ) : (
              <>Register <ChevronRight size={16} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
            Already registered? <Link to="/login" className="text-white hover:text-blue-400 transition-colors underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

