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

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedPlan: location.state?.plan || 'Class III: Prime',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToRisk, setAgreedToRisk] = useState(false);
  const [errors, setErrors] = useState({});

  // Investment Plans
  const plans = [
    { name: 'Class I: Entry', yield: '6-9%', min: '€100' },
    { name: 'Class II: Core', yield: '9-12%', min: '€1,000' },
    { name: 'Class III: Prime', yield: '12-16%', min: '€5,000' },
    { name: 'Class IV: Institutional', yield: '16-20%', min: '€15,000' },
    { name: 'Class V: Sovereign', yield: '20-25%', min: '€50,000' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
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
    const toastId = toast.loading('Creating your account...');

    try {
      const result = await signup({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        activePlan: formData.selectedPlan,
      });

      if (result?.success) {
        toast.success('Account created successfully!', { id: toastId });
        setTimeout(() => navigate('/dashboard', { replace: true }), 800);
      } else {
        toast.error(result?.message || 'Registration failed', { id: toastId });
        setErrors({ auth: result?.message || 'Registration failed' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed', { id: toastId });
      setErrors({ auth: err.response?.data?.message || 'Registration failed' });
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
        {/* Header */}
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

        {/* Error Alert */}
        {errors.auth && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-xs font-bold mb-6"
          >
            <AlertCircle size={18} />
            {errors.auth}
          </motion.div>
        )}

        {/* Form Card */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck size={120} className="text-emerald-500" />
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-8 z-10">
            
            {/* Plan Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Select Investment Strategy
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, selectedPlan: plan.name })}
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

            {/* Name Fields */}
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
                  required
                  className={`w-full bg-white/5 border ${
                    errors.firstName ? 'border-rose-500' : 'border-white/10'
                  } rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
                />
                {errors.firstName && (
                  <p className="text-rose-500 text-xs ml-1">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  placeholder="Smith"
                  onChange={handleChange}
                  required
                  className={`w-full bg-white/5 border ${
                    errors.lastName ? 'border-rose-500' : 'border-white/10'
                  } rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
                />
                {errors.lastName && (
                  <p className="text-rose-500 text-xs ml-1">{errors.lastName}</p>
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
                value={formData.email}
                placeholder="investor@example.com"
                onChange={handleChange}
                required
                className={`w-full bg-white/5 border ${
                  errors.email ? 'border-rose-500' : 'border-white/10'
                } rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
              />
              {errors.email && (
                <p className="text-rose-500 text-xs ml-1">{errors.email}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    placeholder="Minimum 8 characters"
                    onChange={handleChange}
                    required
                    className={`w-full bg-white/5 border ${
                      errors.password ? 'border-rose-500' : 'border-white/10'
                    } rounded-2xl px-6 py-4 pr-12 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-emerald-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-rose-500 text-xs ml-1">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    placeholder="Confirm your password"
                    onChange={handleChange}
                    required
                    className={`w-full bg-white/5 border ${
                      errors.confirmPassword ? 'border-rose-500' : 'border-white/10'
                    } rounded-2xl px-6 py-4 pr-12 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-700`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-emerald-500"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-rose-500 text-xs ml-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Risk Acknowledgement */}
            <div className={`bg-emerald-500/5 border ${
              errors.risk ? 'border-rose-500' : 'border-emerald-500/20'
            } p-6 rounded-2xl flex items-start gap-4`}>
              <input
                type="checkbox"
                checked={agreedToRisk}
                onChange={(e) => {
                  setAgreedToRisk(e.target.checked);
                  setErrors((prev) => ({ ...prev, risk: '' }));
                }}
                className="mt-1 accent-emerald-500 w-4 h-4 cursor-pointer"
              />
              <div>
                <p className="text-[9px] text-gray-500 leading-relaxed uppercase font-black tracking-wider">
                  I acknowledge the Investment Risk Disclosure. I understand that cryptocurrency investments 
                  are subject to market volatility and liquidity risks. Past performance does not guarantee 
                  future returns. I confirm that I am at least 18 years old and eligible to invest in my jurisdiction.
                </p>
                {errors.risk && (
                  <p className="text-rose-500 text-xs mt-2">{errors.risk}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl transition-all flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs ${
                loading
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-[0.98] shadow-lg shadow-emerald-500/10'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
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

        {/* Security Footer */}
        <div className="mt-8 text-center text-[9px] font-black text-gray-700 uppercase tracking-[0.3em] flex items-center justify-center gap-4">
          <ShieldCheck size={14} className="text-emerald-500/40" />
          End-to-End Encrypted • SEC Digital Framework 2024
        </div>
      </motion.div>
    </div>
  );
}
