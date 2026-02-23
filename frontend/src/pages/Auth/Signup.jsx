import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useBtcPrice } from '../../hooks/useBtcPrice';
import api from '../../api/api';
import {
  Mail, Lock, User, Phone, RefreshCw, ChevronRight, ShieldCheck,
  Check, X
} from 'lucide-react';

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────

const PASSWORD_MIN_LENGTH = 8;

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= PASSWORD_MIN_LENGTH },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p) => /[\W_]/.test(p) }
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strip everything except digits and leading +
const normalizePhone = (raw) => raw.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');

// ──────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordRef = useRef(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const btcPrice = useBtcPrice(60_000);

  // ── Redirect if already logged in ──
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // ── Memoized price display ──
  const formattedPrice = useMemo(() => {
    if (!btcPrice) return null;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(btcPrice);
  }, [btcPrice]);

  // ── Password strength evaluation ──
  const passwordStrength = useMemo(() => {
    return PASSWORD_RULES.map((rule) => ({
      ...rule,
      passed: rule.test(formData.password)
    }));
  }, [formData.password]);

  const allPasswordRulesPassed = passwordStrength.every((r) => r.passed);

  // ── Input handler ──
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error on change
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  // ── Validation (returns all errors at once) ──
  const validateForm = useCallback(() => {
    const { fullName, email, phone, password, confirmPassword } = formData;
    const errs = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full name is required';
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    const normalized = normalizePhone(phone);
    if (normalized.length < 7 || normalized.length > 16) {
      errs.phone = 'Please enter a valid phone number (7–15 digits)';
    }

    if (!allPasswordRulesPassed) {
      errs.password = 'Password does not meet all requirements';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    return errs;
  }, [formData, allPasswordRulesPassed]);

  // ── Submit handler ──
  const handleRegister = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Show first error as toast for immediate feedback
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }

    setLoading(true);

    // Clear passwords from state BEFORE any async work
    const submitData = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: normalizePhone(formData.phone),
      password: formData.password
    };

    setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));

    try {
      const res = await api.post('/auth/register', submitData);

      const { user, token } = res.data;

      if (!user || !token) {
        throw new Error('Invalid server response');
      }

      await login(user, token);

      toast.success('Account created successfully');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Registration failed';

      toast.error(message);
      passwordRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Field error helper ──
  const fieldError = (name) =>
    errors[name] ? (
      <p className="text-red-400 text-[10px] mt-1 pl-14 font-semibold uppercase tracking-wider">
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center py-12 px-6 selection:bg-yellow-500/30">
      {/* ── Header ── */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div
          className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-6 shadow-2xl shadow-yellow-500/20"
          aria-hidden="true"
        >
          T
        </div>
        <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter">
          Create Account
        </h1>
        <p
          className="text-slate-500 text-xs uppercase tracking-[0.4em] font-black mt-3"
          aria-live="polite"
        >
          Network Status:{' '}
          {formattedPrice ? (
            <span className="text-yellow-500 font-mono">BTC @ {formattedPrice}</span>
          ) : (
            <span className="animate-pulse text-slate-700 font-mono">Synchronizing...</span>
          )}
        </p>
      </div>

      {/* ── Form Card ── */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/[0.01] p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-3xl">
          <form onSubmit={handleRegister} className="space-y-4" noValidate>

            {/* Full Name */}
            <div>
              <div className="relative group">
                <User
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors"
                  size={18}
                  aria-hidden="true"
                />
                <label htmlFor="signup-fullName" className="sr-only">Full name</label>
                <input
                  id="signup-fullName"
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  placeholder="FULL LEGAL NAME"
                  className={`w-full bg-black/60 border rounded-2xl py-4 pl-14 pr-5 text-white outline-none transition-all placeholder:text-slate-800 text-[10px] font-black uppercase tracking-widest ${
                    errors.fullName ? 'border-red-500/50' : 'border-white/5 focus:border-yellow-600/50'
                  }`}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              {fieldError('fullName')}
            </div>

            {/* Email */}
            <div>
              <div className="relative group">
                <Mail
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors"
                  size={18}
                  aria-hidden="true"
                />
                <label htmlFor="signup-email" className="sr-only">Email address</label>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="INVESTOR EMAIL"
                  className={`w-full bg-black/60 border rounded-2xl py-4 pl-14 pr-5 text-white outline-none transition-all placeholder:text-slate-800 text-[10px] font-black uppercase tracking-widest ${
                    errors.email ? 'border-red-500/50' : 'border-white/5 focus:border-yellow-600/50'
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              {fieldError('email')}
            </div>

            {/* Phone */}
            <div>
              <div className="relative group">
                <Phone
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors"
                  size={18}
                  aria-hidden="true"
                />
                <label htmlFor="signup-phone" className="sr-only">Phone number</label>
                <input
                  id="signup-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="CONTACT PHONE"
                  className={`w-full bg-black/60 border rounded-2xl py-4 pl-14 pr-5 text-white outline-none transition-all placeholder:text-slate-800 text-[10px] font-black uppercase tracking-widest ${
                    errors.phone ? 'border-red-500/50' : 'border-white/5 focus:border-yellow-600/50'
                  }`}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              {fieldError('phone')}
            </div>

            {/* Password */}
            <div>
              <div className="relative group">
                <Lock
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors"
                  size={18}
                  aria-hidden="true"
                />
                <label htmlFor="signup-password" className="sr-only">Password</label>
                <input
                  ref={passwordRef}
                  id="signup-password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="ACCESS PASSWORD"
                  className={`w-full bg-black/60 border rounded-2xl py-4 pl-14 pr-5 text-white outline-none transition-all placeholder:text-slate-800 text-[10px] font-black uppercase tracking-widest ${
                    errors.password ? 'border-red-500/50' : 'border-white/5 focus:border-yellow-600/50'
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setShowPasswordRules(true)}
                  onBlur={() => setShowPasswordRules(false)}
                  required
                  disabled={loading}
                />
              </div>
              {fieldError('password')}

              {/* Live password strength indicators */}
              {showPasswordRules && formData.password.length > 0 && (
                <ul className="mt-2 pl-14 space-y-1" aria-label="Password requirements">
                  {passwordStrength.map((rule) => (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                        rule.passed ? 'text-green-400' : 'text-slate-600'
                      }`}
                    >
                      {rule.passed ? (
                        <Check size={12} aria-hidden="true" />
                      ) : (
                        <X size={12} aria-hidden="true" />
                      )}
                      {rule.label}
                    </li>
                  ))}
