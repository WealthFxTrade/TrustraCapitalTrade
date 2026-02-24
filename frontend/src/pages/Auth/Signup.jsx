import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useBtcPrice } from '../../hooks/useBtcPrice';
import api from '../../api/api';
import { 
  Mail, Lock, User, Phone, ChevronRight, ShieldCheck, Check, X 
} from 'lucide-react';

// ──────────────────────────────────────────────
// CONSTANTS & UTILS
// ──────────────────────────────────────────────
const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p) => /[\W_]/.test(p) }
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizePhone = (raw) => raw.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const passwordRef = useRef(null);
  
  const { login, user, initialized } = useAuth();
  const navigate = useNavigate();
  const btcPrice = useBtcPrice(60_000);

  // ── Auth Guard: Redirect if session exists ──
  useEffect(() => {
    if (initialized && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, initialized, navigate]);

  const formattedPrice = useMemo(() => {
    if (!btcPrice) return null;
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(btcPrice);
  }, [btcPrice]);

  const passwordStrength = useMemo(() => {
    return PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(formData.password) }));
  }, [formData.password]);

  const allRulesPassed = passwordStrength.every((r) => r.passed);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. Client-side Validation (Keep for instant feedback)
    if (!formData.fullName.trim()) return toast.error('Full legal name is required');
    if (!EMAIL_REGEX.test(formData.email)) return toast.error('Invalid email address');
    if (!allRulesPassed) return toast.error('Password requirements not met');
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');

    const submitData = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: normalizePhone(formData.phone),
      password: formData.password
    };

    try {
      // API call triggers NProgress loading bar via interceptor
      const res = await api.post('/auth/register', submitData);
      
      const userData = res.data.user || res.data.data;
      const token = res.data.token;

      if (!userData || !token) throw new Error('Registration succeeded but session failed');

      // Sync Global Auth State
      login(userData, token);
      toast.success('Portfolio Established Successfully');
    } catch (err) {
      // NOTE: Error toasts (400, 401, 500) are handled globally in api.js.
      // We only handle component-specific cleanup here.
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      passwordRef.current?.focus();
    }
  };

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-6 shadow-2xl shadow-yellow-500/20">T</div>
        <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter">Create Account</h1>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-black mt-3">
          Network Status: {formattedPrice ? <span className="text-yellow-500">BTC @ {formattedPrice}</span> : "Synchronizing..."}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/[0.01] p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-3xl">
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input name="fullName" type="text" placeholder="FULL LEGAL NAME" className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase tracking-widest" value={formData.fullName} onChange={handleChange} />
            </div>

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input name="email" type="email" placeholder="INVESTOR@TRUSTRA.COM" className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase tracking-widest" value={formData.email} onChange={handleChange} />
            </div>

            {/* Phone */}
            <div className="relative group">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input name="phone" type="tel" placeholder="+1 000 000 0000" className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase tracking-widest" value={formData.phone} onChange={handleChange} />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input ref={passwordRef} name="password" type="password" placeholder="PASSWORD" className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase tracking-widest" value={formData.password} onChange={handleChange} onFocus={() => setShowPasswordRules(true)} />
            </div>

            {/* Rules Grid */}
            {showPasswordRules && (
              <div className="grid grid-cols-2 gap-2 p-4 bg-black/40 rounded-2xl border border-white/5">
                {passwordStrength.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {rule.passed ? <Check size={10} className="text-yellow-500" /> : <X size={10} className="text-slate-700" />}
                    <span className={`text-[8px] uppercase font-bold tracking-tighter ${rule.passed ? 'text-white' : 'text-slate-600'}`}>{rule.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Confirm Password */}
            <div className="relative group">
              <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input name="confirmPassword" type="password" placeholder="CONFIRM ACCESS KEY" className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase tracking-widest" value={formData.confirmPassword} onChange={handleChange} />
            </div>

            <button type="submit" className="w-full bg-white text-black hover:bg-yellow-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-95">
              <span>Establish Portfolio</span>
              <ChevronRight size={14} />
            </button>

            <div className="text-center mt-6">
              <Link to="/login" className="text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Already an investor? <span className="text-yellow-500">Log In</span></Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
