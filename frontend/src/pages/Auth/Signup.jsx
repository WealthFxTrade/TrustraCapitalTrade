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
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const INVESTMENT_PLANS = [
  { name: 'Class I: Entry', yield: '6-9%', min: '€100' },
  { name: 'Class II: Core', yield: '9-12%', min: '€1,000' },
  { name: 'Class III: Prime', yield: '12-16%', min: '€5,000' },
  { name: 'Class IV: Institutional', yield: '16-20%', min: '€15,000' },
  { name: 'Class V: Sovereign', yield: '20-25%', min: '€50,000' },
];

const DEFAULT_PLAN = 'Class III: Prime';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialPlan = INVESTMENT_PLANS.some(
    (plan) => plan.name === location.state?.plan
  ) ? location.state?.plan : DEFAULT_PLAN;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedPlan: initialPlan,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToRisk, setAgreedToRisk] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    const trimmedEmail = formData.email.trim().toLowerCase();
    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToRisk) {
      newErrors.risk = 'You must acknowledge the investment risk disclosure';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validate()) {
      toast.error('Please correct the highlighted fields');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Creating your account...');

    try {
      const payload = {
        name: `\( {formData.firstName.trim()} \){formData.lastName.trim()}`,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        activePlan: formData.selectedPlan,
      };

      const result = await signup(payload);

      if (result?.success) {
        toast.success('Account created successfully! Please login.', { id: toastId });
        navigate('/login', { replace: true });
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message, { id: toastId });
      setErrors({ auth: message });
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
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl z-10 py-12"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
            <PieChart className="text-emerald-500" size={32} />
          </div>

          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            Open{' '}
            <span className="text-emerald-500">Investment Account</span>
          </h1>

          <p className="text-[10px] font-black text-gray-500 tracking-[0.3em] mt-2 uppercase">
            Institutional Wealth Management • Global Crypto Access
          </p>
        </div>

        {/* Auth Error */}
        {errors.auth && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-sm mb-6"
          >
            <AlertCircle size={20} />
            <span>{errors.auth}</span>
          </motion.div>
        )}

        {/* Form Card */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck size={120} className="text-emerald-500" />
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-8" noValidate>
            {/* Plan Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Select Investment Strategy
              </label>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {INVESTMENT_PLANS.map((plan) => {
                  const isSelected = formData.selectedPlan === plan.name;
                  return (
                    <button
                      key={plan.name}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, selectedPlan: plan.name }))}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className={`text-[8px] font-black uppercase ${isSelected ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {plan.name.split(': ')[1] || plan.name}
                      </p>
                      <p className="text-xs font-black mt-1 text-white">{plan.yield}</p>
                      <p className="text-[8px] text-gray-600 mt-1">Min: {plan.min}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border ${errors.firstName ? 'border-rose-500' : 'border-white/10'} rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none`}
                  placeholder="Ikenna"
                />
                {errors.firstName && <p className="text-rose-500 text-xs">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border ${errors.lastName ? 'border-rose-500' : 'border-white/10'} rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none`}
                  placeholder="Prince"
                />
                {errors.lastName && <p className="text-rose-500 text-xs">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-white/5 border ${errors.email ? 'border-rose-500' : 'border-white/10'} rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none`}
                placeholder="kayblizz2015@gmail.com"
              />
              {errors.email && <p className="text-rose-500 text-xs">{errors.email}</p>}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full bg-white/5 border ${errors.password ? 'border-rose-500' : 'border-white/10'} rounded-2xl px-6 py-4 pr-12 text-sm focus:border-emerald-500 outline-none`}
                    placeholder="Secure password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-500 text-xs">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full bg-white/5 border ${errors.confirmPassword ? 'border-rose-500' : 'border-white/10'} rounded-2xl px-6 py-4 pr-12 text-sm focus:border-emerald-500 outline-none`}
                    placeholder="Confirm password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-rose-500 text-xs">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Risk Acknowledgement */}
            <div className={`p-6 rounded-2xl border ${errors.risk ? 'border-rose-500' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToRisk}
                  onChange={(e) => setAgreedToRisk(e.target.checked)}
                  className="mt-1 accent-emerald-500"
                />
                <span className="text-[13px] text-gray-400 leading-relaxed">
                  I acknowledge the Investment Risk Disclosure. Cryptocurrency investments are subject to market volatility and liquidity risks. I confirm that I am at least 18 years old.
                </span>
              </label>
              {errors.risk && <p className="text-rose-500 text-xs mt-2">{errors.risk}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 ${
                loading
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-500 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
