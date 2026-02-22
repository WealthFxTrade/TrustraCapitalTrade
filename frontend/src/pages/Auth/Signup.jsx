import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import {
  Mail, Lock, User, Phone, RefreshCw, ChevronRight, ShieldCheck
} from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [btcPrice, setBtcPrice] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // 📈 LIVE BTC PRICE
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur'
        );
        const data = await res.json();
        if (data?.bitcoin?.eur) setBtcPrice(data.bitcoin.eur);
      } catch {
        console.warn("BTC oracle sync delayed");
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // every 60s
    return () => clearInterval(interval);
  }, []);

  const formattedPrice = btcPrice
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(btcPrice)
    : null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const { fullName, email, phone, password, confirmPassword } = formData;

    if (!fullName.trim()) return 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email address';
    if (!/^\+?[0-9]{7,15}$/.test(phone)) return 'Invalid phone number';
    if (password !== confirmPassword) return 'Passwords do not match';
    if (password.length < 8) return 'Password too short (min 8 chars)';
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain a number';
    if (!/[\W_]/.test(password)) return 'Password must contain a special character';
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) return toast.error(`❌ ${validationError}`);

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password
      });

      const { user, token } = res.data;
      await login(user, token);

      toast.success('✅ Node initialized and synced successfully!');
      navigate('/dashboard', { replace: true });

      // Clear sensitive fields
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(`❌ ${message}`);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center py-12 px-6 selection:bg-yellow-500/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-6 shadow-2xl shadow-yellow-500/20">
          T
        </div>
        <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">Initialize Node</h2>
        <p className="text-slate-500 text-[9px] uppercase tracking-[0.4em] font-black mt-3">
          ORACLE STATUS: {formattedPrice ? (
            <span className="text-yellow-500 font-mono">BTC @ {formattedPrice}</span>
          ) : (
            <span className="animate-pulse text-slate-700 font-mono uppercase">Syncing...</span>
          )}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/[0.01] p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-3xl">
          <form onSubmit={handleRegister} className="space-y-4">

            {/* Full Name */}
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder="FULL LEGAL NAME"
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 transition-all placeholder:text-slate-800 text-[10px] font-black uppercase tracking-widest"
                value={formData.fullName}
                onChange={handleChange}
                required
                aria-label="Full Name"
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="INVESTOR EMAIL"
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 transition-all placeholder:text-slate-800 text-[10px] font-black uppercase tracking-widest"
                value={formData.email}
                onChange={handleChange}
                required
                aria-label="Email"
              />
            </div>

            {/* Phone */}
            <div className="relative group">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <label htmlFor="phone" className="sr-only">Phone</label>
              <input
                id="phone"
                type="text"
                name="phone"
                placeholder="CONTACT PHONE"
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 transition-all placeholder:text-slate-800 text-[10px] font-black uppercase tracking-widest"
                value={formData.phone}
                onChange={handleChange}
                required
                aria-label="Phone"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="ACCESS PASSWORD"
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 transition-all placeholder:text-slate-800 text-[10px] font-black uppercase tracking-widest"
                value={formData.password}
                onChange={handleChange}
                required
                aria-label="Password"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative group">
              <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="CONFIRM ACCESS"
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 transition-all placeholder:text-slate-800 text-[10px] font-black uppercase tracking-widest"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                aria-label="Confirm Password"
              />
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black hover:bg-yellow-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <><RefreshCw className="animate-spin" size={18} /> INITIALIZING NODE...</>
                ) : (
                  <>AUTHORIZE ACCESS <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-8">
            <Link
              to="/login"
              className="text-yellow-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              Node Already Active? Sync Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
