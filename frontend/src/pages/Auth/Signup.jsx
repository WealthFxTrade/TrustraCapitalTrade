// src/pages/Auth/Signup.jsx
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useBtcPrice } from '../../hooks/useBtcPrice';
import { register as registerApi } from '../../api/api';
import { Mail, Lock, User, Phone, ChevronRight, Check, X, Activity, ShieldCheck } from 'lucide-react';

const PASSWORD_RULES = [
  { label: '8+ Characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase', test: (p) => /[A-Z]/.test(p) },
  { label: 'Number', test: (p) => /[0-9]/.test(p) },
  { label: 'Special Symbol', test: (p) => /[\W_]/.test(p) },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizePhone = (raw) => raw.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');

export default function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login: contextLogin, initialized } = useAuth();
  
  // State management
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordRef = useRef(null);

  // Catch the selected plan from Landing page
  const selectedPlan = location.state?.plan || 'Standard';

  const btcPrice = useBtcPrice(60000);
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
    const trimmedName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();

    if (!trimmedName) return toast.error('Full legal name is required');
    if (!EMAIL_REGEX.test(trimmedEmail)) return toast.error('Invalid email address');
    if (!allRulesPassed) return toast.error('Password requirements not met');
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');

    setIsSubmitting(true);
    try {
      const res = await registerApi({
        fullName: trimmedName,
        email: trimmedEmail,
        phone: normalizePhone(formData.phone),
        password: formData.password,
        initialPlan: selectedPlan // Passing the plan caught from Landing
      });

      const userData = res.user || res.data || res;
      const token = res.token || res.accessToken;

      if (!userData || !token) throw new Error('Session initialization failed');

      contextLogin(userData, token);
      toast.success('Portfolio Established Successfully');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      passwordRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-yellow-500 font-black uppercase tracking-[0.3em] text-[10px]">
        Trustra Node: Initializing...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center py-12 px-6 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-6 shadow-2xl shadow-yellow-500/20">
          T
        </div>
        <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter">Create Account</h1>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-black mt-3 flex items-center justify-center gap-2">
          <Activity size={12} className="text-green-500 animate-pulse" />
          Network Status: <span className="text-yellow-500">BTC @ {formattedPrice}</span>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/[0.02] p-8 md:p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
          
          {/* Plan Indicator */}
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-between">
            <div className="text-[10px] uppercase font-black text-yellow-500 tracking-widest">Selected Tier</div>
            <div className="text-sm font-bold text-white flex items-center gap-2 italic">
               {selectedPlan.replace('rio', 'Rio ')} <ShieldCheck size={14} className="text-yellow-500" />
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                name="fullName"
                placeholder="Full Legal Name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-yellow-500/50 focus:ring-0 transition-all outline-none"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-yellow-500/50 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                ref={passwordRef}
                type="password"
                name="password"
                placeholder="Secure Password"
                onFocus={() => setShowPasswordRules(true)}
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-yellow-500/50 outline-none transition-all"
              />
            </div>

            {showPasswordRules && (
              <div className="grid grid-cols-2 gap-2 px-2 pb-2">
                {passwordStrength.map((rule, i) => (
                  <div key={i} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${rule.passed ? 'text-green-500' : 'text-slate-600'}`}>
                    {rule.passed ? <Check size={10} /> : <X size={10} />} {rule.label}
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-yellow-500/50 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black py-5 rounded-2xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Synchronizing Node...' : 'Establish Portfolio'}
              <ChevronRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs font-medium">
              Already a member?{' '}
              <Link to="/login" className="text-yellow-500 font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
      
      <p className="mt-12 text-center text-[9px] text-slate-700 uppercase tracking-[0.3em] font-bold max-w-xs mx-auto leading-relaxed">
        By continuing, you agree to Trustra Capital v8.4.1 Audit Protocols and Risk Terms.
      </p>
    </div>
  );
}

