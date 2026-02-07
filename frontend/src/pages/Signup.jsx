import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, Mail, Lock, User, ShieldCheck, Globe, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/api'; 

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validation
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (formData.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setLoading(true);
    try {
      // Hits: https://trustracapitaltrade-backend.onrender.com
      const response = await api.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      const { user, token } = response.data;

      // Log the user in immediately upon successful registration
      login(user, token);

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      // Uses the normalized error message from your axios interceptor
      toast.error(error.response?.data?.message || 'Registration failed');
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

      <div className="w-full max-w-md bg-slate-900/40 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2 uppercase italic italic">Register</h2>
          <p className="text-slate-400 text-sm font-medium">Join 2016's most secure investment node</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="password"
              placeholder="Create Password"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all font-mono"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all font-mono"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 ${
              loading ? 'bg-blue-600/50 text-slate-300' : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
            }`}
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500 text-xs font-medium">
          <p>Already have an account? <Link to="/login" className="text-blue-400 font-bold hover:underline">Sign In here</Link></p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center items-center gap-2 text-slate-600">
          <ShieldCheck className="h-4 w-4 text-blue-500/50" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Institutional Grade Encryption</span>
        </div>
      </div>
      
      <div className="mt-12 text-center opacity-50">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em] italic mb-2">© 2016–2026 Trustra Capital Trade</p>
        <p className="text-[8px] text-slate-700 max-w-xs mx-auto">Digital asset investments involve significant risk. Trustra operates under 2026 Asset Security Directives.</p>
      </div>
    </div>
  );
}

