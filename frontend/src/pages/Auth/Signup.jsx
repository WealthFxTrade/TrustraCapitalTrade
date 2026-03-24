// src/pages/Auth/Signup.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Loader2,
  Gift,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Globe,
  ChevronDown,
} from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, isAuthenticated, initialized } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    inviteCode: searchParams.get('invite') || '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  // Country codes for phone
  const countryCodes = [
    { code: '+234', label: 'Nigeria (+234)', flag: '🇳🇬' },
    { code: '+1', label: 'United States / Canada (+1)', flag: '🇺🇸' },
    { code: '+44', label: 'United Kingdom (+44)', flag: '🇬🇧' },
    { code: '+91', label: 'India (+91)', flag: '🇮🇳' },
    { code: '+49', label: 'Germany (+49)', flag: '🇩🇪' },
    { code: '+33', label: 'France (+33)', flag: '🇫🇷' },
    { code: '+39', label: 'Italy (+39)', flag: '🇮🇹' },
    { code: '+81', label: 'Japan (+81)', flag: '🇯🇵' },
    { code: '+86', label: 'China (+86)', flag: '🇨🇳' },
    { code: '+61', label: 'Australia (+61)', flag: '🇦🇺' },
    { code: '+55', label: 'Brazil (+55)', flag: '🇧🇷' },
    { code: '+27', label: 'South Africa (+27)', flag: '🇿🇦' },
  ];

  const [selectedCountryCode, setSelectedCountryCode] = useState('+234');

  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, initialized, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, ''); // only digits
      setFormData((prev) => ({ ...prev, phone: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: '', color: '' };
    if (pwd.length < 8) return { strength: 'Weak', color: 'text-rose-400' };
    if (pwd.length < 12 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      return { strength: 'Medium', color: 'text-yellow-400' };
    }
    return { strength: 'Strong', color: 'text-emerald-400' };
  };

  const validateForm = () => {
    const newErrors = {};
    const values = {
      name: formData.name.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim(),
      inviteCode: formData.inviteCode.trim(),
    };

    if (!values.name) newErrors.name = 'Full name is required';
    if (!values.username) newErrors.username = 'Username is required';
    else if (values.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(values.username)) {
      newErrors.username = 'Only letters, numbers, and underscore allowed';
    }

    if (!values.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (values.phone && !/^\d{9,15}$/.test(values.phone)) {
      newErrors.phone = 'Phone number should be 9–15 digits (without country code)';
    }

    if (!values.password) newErrors.password = 'Password is required';
    else if (values.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreed) newErrors.agreed = 'You must accept the terms and risk disclosure';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      setLoading(false); // ← IMPORTANT FIX: stop loading even on validation fail
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Initializing secure node...');

    try {
      const payload = {
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim(),
        phone: formData.phone ? `\( {selectedCountryCode} \){formData.phone}` : undefined,
        password: formData.password.trim(),
        referredByCode: formData.inviteCode.trim().toUpperCase() || undefined,
      };

      const response = await signup(payload);

      if (response?.success) {
        toast.success('Node successfully initialized', { id: toastId });
        setTimeout(() => navigate('/dashboard', { replace: true }), 800);
      } else {
        throw new Error(response?.message || 'Signup unsuccessful');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Node initialization failed. Please check your details.';
      toast.error(message, { id: toastId, duration: 6000 });
    } finally {
      setLoading(false); // ← Always stop loading here
    }
  };

  const pwStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-yellow-500/10 rounded-3xl border border-yellow-500/20 shadow-lg shadow-yellow-900/10">
            <ShieldCheck className="text-yellow-500" size={40} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white">
            Initialize <span className="text-yellow-500">Node</span>
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Create your secure Trustra Capital terminal
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0a0c10]/90 backdrop-blur-2xl border border-white/8 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/5 to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Name + Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-black uppercase text-gray-500 tracking-[0.25em] ml-1 block">
                  Full Name *
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className={`w-full bg-black/50 border ${errors.name ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-yellow-500/50'} rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p id="name-error" className="text-rose-400 text-xs mt-1 ml-2">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-xs font-black uppercase text-gray-500 tracking-[0.25em] ml-1 block">
                  Username *
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                  className={`w-full bg-black/50 border ${errors.username ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-yellow-500/50'} rounded-2xl py-4 px-4 outline-none transition-all font-medium placeholder:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="johndoe88"
                />
                {errors.username && (
                  <p id="username-error" className="text-rose-400 text-xs mt-1 ml-2">
                    {errors.username}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-black uppercase text-gray-500 tracking-[0.25em] ml-1 block">
                Node Email *
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`w-full bg-black/50 border ${errors.email ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-yellow-500/50'} rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="node@trustra.capital"
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-rose-400 text-xs mt-1 ml-2">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone – International */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-xs font-black uppercase text-gray-500 tracking-[0.25em] ml-1 block">
                Phone (International – Optional)
              </label>
              <div className="flex gap-3">
                <div className="relative w-36 min-w-[140px]">
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    disabled={loading}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-medium outline-none focus:border-yellow-500/50 transition-all appearance-none pr-8"
                    aria-label="Select country code"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>

                <div className="relative flex-1 group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                    className={`w-full bg-black/50 border ${errors.phone ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-yellow-500/50'} rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="Enter phone number (digits only)"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-gray-600 ml-2">
                <Globe size={14} />
                <span>Selected: {countryCodes.find(c => c.code === selectedCountryCode)?.label || 'Custom'}</span>
              </div>

              {errors.phone && (
                <p id="phone-error" className="text-rose-400 text-xs mt-1 ml-2">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-black uppercase text-gray-500 tracking-[0.25em] ml-1 block">
                  Node Cipher *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className={`w-full bg-black/50 border ${errors.password ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-yellow-500/50'} rounded-2xl py-4 pl-12 pr-12 outline-none transition-all font-medium placeholder:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white focus:outline-none transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password ? (
                  <p id="password-error" className="text-rose-400 text-xs mt-1 ml-2">
                    {errors.password}
                  </p>
                ) : formData.password && (
                  <p className={`text-xs mt-1 ml-2 ${pwStrength.color}`}>
                    Password strength: {pwStrength.strength}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-xs font-black uppercase text-gray-500 tracking-[0.25em] ml-1 block">
                  Confirm Cipher *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                    className={`w-full bg-black/50 border ${errors.confirmPassword ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-yellow-500/50'} rounded-2xl py-4 pl-12 pr-12 outline-none transition-all font-medium placeholder:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white focus:outline-none transition-colors"
                    aria-label={showConfirmPassword ? 'Hide confirmation' : 'Show confirmation'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-error" className="text-rose-400 text-xs mt-1 ml-2">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Invite Code */}
            <div className="space-y-2">
              <label htmlFor="inviteCode" className="text-xs font-black uppercase text-gray-500 tracking-[0.25em] ml-1 block">
                Invite Code (Optional)
              </label>
              <div className="relative group">
                <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                <input
                  id="inviteCode"
                  type="text"
                  name="inviteCode"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  disabled={loading || searchParams.get('invite')}
                  className={`w-full bg-black/50 border ${errors.inviteCode ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-yellow-500/50'} rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-yellow-500 font-bold`}
                  placeholder="REFERRAL-CODE"
                />
              </div>
              {errors.inviteCode && (
                <p className="text-rose-400 text-xs mt-1 ml-2">
                  {errors.inviteCode}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={() => {
                  setAgreed(!agreed);
                  setErrors((prev) => ({ ...prev, agreed: '' }));
                }}
                disabled={loading}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-black/50 focus:ring-yellow-500/50 accent-yellow-500"
                aria-invalid={!!errors.agreed}
                aria-describedby={errors.agreed ? 'terms-error' : undefined}
              />
              <label htmlFor="terms" className="text-[10px] text-gray-400 leading-relaxed cursor-pointer">
                I acknowledge the <Link to="/terms" className="text-yellow-500 hover:underline" target="_blank">Risk Disclosure</Link> and agree to the 2026 automated trading protocol terms.
              </label>
            </div>
            {errors.agreed && (
              <p id="terms-error" className="text-rose-400 text-xs ml-2">
                {errors.agreed}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black uppercase text-base tracking-wider flex items-center justify-center gap-3 transition-all shadow-xl ${
                loading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Initializing Node...
                </>
              ) : (
                <>
                  Create Secure Node
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-10 text-center text-sm text-gray-500">
            Already have a node?{' '}
            <Link to="/login" className="text-yellow-500 font-bold hover:text-yellow-400 transition-colors">
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="text-center text-[10px] text-gray-600 uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Secure Node Creation • AES-256 Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
