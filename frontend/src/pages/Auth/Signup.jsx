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
  )
    ? location.state?.plan
    : DEFAULT_PLAN;

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

    const trimmedFirstName = formData.firstName.trim();
    const trimmedLastName = formData.lastName.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();

    if (!trimmedFirstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!trimmedLastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    ) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (
      formData.password.length < 8 ||
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      newErrors.password =
        'Password must contain 8+ characters, uppercase, lowercase, and a number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToRisk) {
      newErrors.risk =
        'You must acknowledge the investment risk disclosure';
    }

    if (
      !INVESTMENT_PLANS.some(
        (plan) => plan.name === formData.selectedPlan
      )
    ) {
      newErrors.selectedPlan = 'Invalid investment plan selected';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const isValid = validate();

    if (!isValid) {
      toast.error('Please correct the highlighted fields');
      return;
    }

    setLoading(true);

    const toastId = toast.loading('Creating your account...');

    try {
      const payload = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        activePlan: formData.selectedPlan,
      };

      const result = await signup(payload);

      if (result?.success) {
        toast.success('Account created successfully!', {
          id: toastId,
        });

        navigate('/dashboard', { replace: true });
      } else {
        const message =
          result?.message || 'Registration failed';

        toast.error(message, { id: toastId });

        setErrors({
          auth: message,
        });
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Registration failed';

      toast.error(message, {
        id: toastId,
      });

      setErrors({
        auth: message,
      });
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
            <span className="text-emerald-500">
              Investment Account
            </span>
          </h1>

          <p className="text-[10px] font-black text-gray-500 tracking-[0.3em] mt-2 uppercase text-center">
            Institutional Wealth Management • Global Crypto
            Access
          </p>
        </div>

        {/* Auth Error */}
        {errors.auth && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-xs font-bold mb-6"
          >
            <AlertCircle size={18} />
            <span>{errors.auth}</span>
          </motion.div>
        )}

        {/* Form Card */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck
              size={120}
              className="text-emerald-500"
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative z-10 space-y-8"
            noValidate
          >
            {/* Plan Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Select Investment Strategy
              </label>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {INVESTMENT_PLANS.map((plan) => {
                  const isSelected =
                    formData.selectedPlan === plan.name;

                  return (
                    <button
                      key={plan.name}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          selectedPlan: plan.name,
                        }))
                      }
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p
                        className={`text-[8px] font-black uppercase truncate ${
                          isSelected
                            ? 'text-emerald-400'
                            : 'text-gray-500'
                        }`}
                      >
                        {plan.name.split(': ')[1]}
                      </p>

                      <p className="text-xs font-black mt-1 text-white">
                        {plan.yield}
                      </p>

                      <p className="text-[8px] text-gray-600 mt-1">
                        Min: {plan.min}
                      </p>
                    </button>
                  );
                })}
              </div>

              {errors.selectedPlan && (
                <p className="text-rose-500 text-xs ml-1">
                  {errors.selectedPlan}
                </p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  First Name
                </label>

                <input
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  placeholder="John"
                  onChange={handleChange}
                  className={`w-full bg-white/5 border ${
                    errors.firstName
                      ? 'border-rose-500'
                      : 'border-white/10'
                  } rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
                />

                {errors.firstName && (
                  <p className="text-rose-500 text-xs ml-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Last Name
                </label>

                <input
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  placeholder="Smith"
                  onChange={handleChange}
                  className={`w-full bg-white/5 border ${
                    errors.lastName
                      ? 'border-rose-500'
                      : 'border-white/10'
                  } rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
                />

                {errors.lastName && (
                  <p className="text-rose-500 text-xs ml-1">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                placeholder="investor@example.com"
                onChange={handleChange}
                className={`w-full bg-white/5 border ${
                  errors.email
                    ? 'border-rose-500'
                    : 'border-white/10'
                } rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
              />

              {errors.email && (
                <p className="text-rose-500 text-xs ml-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword ? 'text' : 'password'
                    }
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    placeholder="Secure password"
                    onChange={handleChange}
                    className={`w-full bg-white/5 border ${
                      errors.password
                        ? 'border-rose-500'
                        : 'border-white/10'
                    } rounded-2xl px-6 py-4 pr-12 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-rose-500 text-xs ml-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    placeholder="Confirm password"
                    onChange={handleChange}
                    className={`w-full bg-white/5 border ${
                      errors.confirmPassword
                        ? 'border-rose-500'
                        : 'border-white/10'
                    } rounded-2xl px-6 py-4 pr-12 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-emerald-500 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="text-rose-500 text-xs ml-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Risk Disclosure */}
            <div
              className={`bg-emerald-500/5 border ${
                errors.risk
                  ? 'border-rose-500'
                  : 'border-emerald-500/20'
              } p-6 rounded-2xl flex items-start gap-4`}
            >
              <input
                type="checkbox"
                checked={agreedToRisk}
                onChange={(e) => {
                  setAgreedToRisk(e.target.checked);

                  if (errors.risk) {
                    setErrors((prev) => ({
                      ...prev,
                      risk: '',
                    }));
                  }
                }}
                className="mt-1 accent-emerald-500 w-4 h-4 cursor-pointer"
              />

              <div>
                <p className="text-[9px] text-gray-500 leading-relaxed uppercase font-black tracking-wider">
                  I acknowledge the Investment Risk
                  Disclosure. Cryptocurrency investments
                  are subject to market volatility and
                  liquidity risks. Past performance does
                  not guarantee future returns. I confirm
                  that I am at least 18 years old and
                  eligible to invest in my jurisdiction.
                </p>

                {errors.risk && (
                  <p className="text-rose-500 text-xs mt-2">
                    {errors.risk}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl transition-all flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs ${
                loading
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed pointer-events-none'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-[0.98] shadow-lg shadow-emerald-500/10'
              }`}
            >
              {loading ? (
                <>
                  <Loader2
                    className="animate-spin"
                    size={20}
                  />
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-10 text-center text-[10px] text-gray-600 uppercase tracking-[0.2em] font-black">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-emerald-500 hover:underline decoration-emerald-500/30 underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[9px] font-black text-gray-700 uppercase tracking-[0.3em] flex items-center justify-center gap-4">
          <ShieldCheck
            size={14}
            className="text-emerald-500/40"
          />
          End-to-End Encrypted • SEC Digital Framework
          2024
        </div>
      </motion.div>
    </div>
  );
}
