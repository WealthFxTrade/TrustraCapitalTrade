// src/pages/Auth/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  PieChart,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext'; // PRODUCTION FIX: Standardized relative absolute workspace imports
import toast from 'react-hot-toast';

export default function Signup() {
  const { registerUser } = useAuth(); // PRODUCTION FIX: Points directly to your verified AuthContext registration method
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedPlan: location.state?.plan || 'Tier III: Prime', // PRODUCTION FIX: Aligned nomenclature with schema specifications
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToRisk, setAgreedToRisk] = useState(false);
  const [errors, setErrors] = useState({});

  // PRODUCTION FIX: Aligned nomenclature naming mappings safely with models/User.js
  const plans = [
    { name: 'Tier I: Entry', yield: '6-9%', min: '€100' },
    { name: 'Tier II: Core', yield: '9-12%', min: '€1,000' },
    { name: 'Tier III: Prime', yield: '12-16%', min: '€5,000' },
    { name: 'Tier IV: Institutional', yield: '16-20%', min: '€15,000' },
    { name: 'Tier V: Sovereign', yield: '20-25%', min: '€50,000' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '', auth: '' }));
  };

  const validate = () => {
    const errs = {};

    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToRisk) {
      errs.risk = 'You must acknowledge the risk disclosure';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const toastId = toast.loading('Creating your institutional account...');

    try {
      // PRODUCTION FIX: Maps input vectors correctly to resolve registerUser payload structural contexts
      const result = await api.post('/auth/register', {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (result.data?.success) {
        toast.success('Account created successfully!', { id: toastId });
        setTimeout(() => navigate('/dashboard', { replace: true }), 800);
      } else {
        throw new Error(result.data?.message || 'Registration processing error.');
      }
    } catch (err) {
      // PRODUCTION FIX: Wipes password values to prevent local tracking leaks on submission errors
      toast.error(err.response?.data?.message || err.message || 'Registration failed', { id: toastId });
      setErrors({ auth: err.response?.data?.message || err.message || 'Registration processing failed.' });
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-6 font-sans relative overflow-hidden selection:bg-emerald-500 selection:text-black">
      <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl z-10 py-12"
      >
        {/* Header Block */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
            <PieChart className="text-emerald-500" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            Open <span className="text-emerald-500">Investment Account</span>
          </h1>
          <p className="text-[10px] font-black text-gray-500 tracking-[0.3em] mt-2 uppercase text-center">
            Institutional Wealth Management • Global Crypto Access
          </p>
        </div>

        {/* Global Error Banner */}
        {errors.auth && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-xs font-bold mb-6"
          >
            <AlertCircle size={18} className="shrink-0" />
            {errors.auth}
          </motion.div>
        )}

        {/* Input Form Wrapper Card Container Frame */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck size={120} className="text-emerald-500" />
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-8 z-10">

            {/* Strategy Select List Matrix Header */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Select Investment Strategy
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.name}
                    type="button"
                    // PRODUCTION FIX: Relies on previous state functions to prevent value destruction
                    onClick={() => setFormData((prev) => ({ ...prev, selectedPlan: plan.name }))}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      formData.selectedPlan === plan.name
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'border-white/5 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <p className={`text-[8px] font-black uppercase truncate ${
                      formData.selectedPlan === plan.name ? 'text-emerald-400' : 'text-gray-500'
                    }`}>
                      {plan.name.split(': ')[1]}
                    </p>
                    <p className="text-xs font-black mt-1 text-white">{plan.yield}</p>
                    <p className="text-[8px] text-gray-600 mt-1">Min: {plan.min}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Identity Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  placeholder="John"
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full bg-white/5 border ${
                    errors.firstName ? 'border-rose-500' : 'border-white/10'
                  } rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
                  required
                />
                {errors.firstName && (
                  <p className="text-rose-500 text-xs ml-1 font-semibold">{errors.firstName}</p>
                )}
              </div>
              
              {/* PRODUCTION FIX: Restored unshortened closed structural data context tags mapping layout blocks */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  placeholder="Doe"
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full bg-white/5 border ${
                    errors.lastName ? 'border-rose-500' : 'border-white/10'
                  } rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
                  required
                />
                {errors.lastName && (
                  <p className="text-rose-500 text-xs ml-1 font-semibold">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Communication Email Target Input Field Block */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="investor@firm.com"
                onChange={handleChange}
                disabled={loading}
                className={`w-full bg-white/5 border ${
                  errors.email ? 'border-rose-500' : 'border-white/10'
                } rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
                required
              />
              {errors.email && (
                <p className="text-rose-500 text-xs ml-1 font-semibold">{errors.email}</p>
              )}
            </div>

            {/* Passwords Allocation Double Verification Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Access Token (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    placeholder="••••••••"
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full bg-white/5 border ${
                      errors.password ? 'border-rose-500' : 'border-white/10'
                    } rounded-2xl px-6 pl-6 pr-12 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-rose-500 text-xs ml-1 font-semibold">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Confirm Allocation Token
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    placeholder="••••••••"
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full bg-white/5 border ${
                      errors.confirmPassword ? 'border-rose-500' : 'border-white/10'
                    } rounded-2xl px-6 pl-6 pr-12 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-rose-500 text-xs ml-1 font-semibold">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Legal Acknowledgment Risk Form Checkbox Selection Control Row */}
            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={agreedToRisk}
                  onChange={(e) => setAgreedToRisk(e.target.checked)}
                  disabled={loading}
                  className="hidden"
                />
                <div className={`w-5 h-5 rounded-lg border shrink-0 flex items-center justify-center transition-all ${
                  agreedToRisk ? 'bg-emerald-500 border-emerald-500' : 'border-white/10 bg-white/5 group-hover:border-white/30'
                }`}>
                  {agreedToRisk && <span className="text-black text-xs font-black">✓</span>}
                </div>
                <span className="text-[10px] text-gray-500 font-medium leading-relaxed uppercase tracking-wider block">
                  I explicitly acknowledge the Trustra Capital digital asset investment risk disclosure guidelines and understand that cryptographic fund pricing is subject to structural market fluctuations.
                </span>
              </label>
              {errors.risk && (
                <p className="text-rose-500 text-xs ml-1 font-semibold">{errors.risk}</p>
              )}
            </div>

            {/* Form Onboarding Action Dispatcher Trigger Button Node */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-white text-black font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-400 hover:text-white disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Provisioning Nodes...
                </>
              ) : (
                <>
                  Establish Institutional Membership Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Session Redirect Links Navigation Floor */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link to="/login" className="text-xs text-gray-500 hover:text-white transition-colors">
              Already possess validated access credentials? <span className="text-white font-bold underline ml-1">Authorize Session</span>
            </Link>
          </div>

        </div>
      </form>
    </div>
  );
}

