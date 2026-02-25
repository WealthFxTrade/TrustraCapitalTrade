import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useBtcPrice } from '../../hooks/useBtcPrice';
import api from '../../api/api';
import { Mail, Lock, User, Phone, ChevronRight, Check, X, Activity } from 'lucide-react';

const PASSWORD_RULES = [
  { label: '8+ Characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase', test: (p) => /[A-Z]/.test(p) },
  { label: 'Number', test: (p) => /[0-9]/.test(p) },
  { label: 'Special Symbol', test: (p) => /[\W_]/.test(p) },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizePhone = (raw) => raw.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');

export default function Signup() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordRef = useRef(null);

  const { login, initialized } = useAuth();
  const btcPrice = useBtcPrice(60_000);
  const formattedPrice = btcPrice
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(btcPrice)
    : 'SYNCHRONIZING...';

  const passwordStrength = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(formData.password) })),
    [formData.password]
  );

  const allRulesPassed = passwordStrength.every((r) => r.passed);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) return toast.error('Full legal name is required');
    if (!EMAIL_REGEX.test(formData.email)) return toast.error('Invalid email address');
    if (!allRulesPassed) return toast.error('Password requirements not met');
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');

    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/register', {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: normalizePhone(formData.phone),
        password: formData.password,
      });

      const userData = res.data.user || res.data.data || res.data;
      const token = res.data.token;

      if (!userData || !token) throw new Error('Session initialization failed');

      // login() handles the redirect to /dashboard
      login(userData, token);
      toast.success('Portfolio Established Successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      passwordRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-6 shadow-2xl shadow-yellow-500/20">T</div>
        <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter">Create Account</h1>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-black mt-3">
          Network Status: <span className="text-yellow-500">BTC @ {formattedPrice}</span>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/[0.01] p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl">
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input name="fullName" type="text" placeholder="FULL LEGAL NAME" className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase tracking-widest" value={formData.fullName} onChange={handleChange} />
            </div>

            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input name="email" type="email" placeholder="INVESTOR@TRUSTRA.COM" className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase tracking-widest" value={formData.email} onChange={handleChange} />
            </div>

            <div className="relative group">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input name="phone" type="tel" placeholder="+1 000 000 0000" className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase tracking-widest" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input ref={passwordRef} name="password" type="password" placeholder="PASSWORD" className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase tracking-widest" value={formData.password} onChange={handleChange} onFocus={() => setShowPasswordRules(true)} />
            </div>

            {showPasswordRules && (
              <div className="grid grid-cols-2 gap-2 py-2">
                {passwordStrength.map((rule, i) => (
                  <div key={i} className={`flex items-center gap-2 text-[8px] font-black uppercase tracking-widest ${rule.passed ? 'text-green-500' : 'text-slate-600'}`}>
                    {rule.passed ? <Check size={10} /> : <X size={10} />} {rule.label}
                  </div>
                ))}
              </div>
            )}

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input name="confirmPassword" type="password" placeholder="CONFIRM PASSWORD" className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase tracking-widest" value={formData.confirmPassword} onChange={handleChange} />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black hover:bg-yellow-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all disabled:opacity-50">
              {isSubmitting ? 'ESTABLISHING PORTFOLIO...' : 'CREATE ACCOUNT'} <ChevronRight size={14} />
            </button>

            <div className="text-center mt-6">
              <Link to="/login" className="text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                Already an investor? <span className="text-yellow-500">Sign In</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

