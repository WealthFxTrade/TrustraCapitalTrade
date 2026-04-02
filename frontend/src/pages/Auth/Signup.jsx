import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2, ArrowRight, Lock, PieChart } from 'lucide-react';
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
    selectedPlan: location.state?.plan || 'Class III: Prime'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToRisk, setAgreedToRisk] = useState(false);

  // Institutional Asset Classes updated from "Rio" to Portfolio Classes
  const plans = [
    { name: 'Class I: Entry', yield: '6-9%', min: '€100' },
    { name: 'Class II: Core', yield: '9-12%', min: '€1,000' },
    { name: 'Class III: Prime', yield: '12-16%', min: '€5,000' },
    { name: 'Class IV: Institutional', yield: '16-20%', min: '€15,000' },
    { name: 'Class V: Sovereign', yield: '20-25%', min: '€50,000' }
  ];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToRisk) return toast.error("Institutional Risk Acknowledgement required.");
    if (formData.password !== formData.confirmPassword) return toast.error("Access Keys do not match.");

    setLoading(true);
    try {
      const result = await signup({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        activePlan: formData.selectedPlan
      });
      if (result?.success) {
        toast.success("Onboarding Successful. You may now authorize entry.");
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Onboarding Protocol Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-6 font-sans relative overflow-hidden selection:bg-emerald-500 selection:text-black">
      <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl z-10 py-12">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
            <PieChart className="text-emerald-500" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">Open <span className="text-emerald-500">Investment Account</span></h1>
          <p className="text-[10px] font-black text-gray-500 tracking-[0.3em] mt-2 uppercase text-center">Institutional Wealth Management • Global Liquidity Access</p>
        </div>

        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle Branding Overlay */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <ShieldCheck size={120} className="text-emerald-500" />
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-8 z-10">
            {/* Allocation Strategy Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Select Allocation Strategy</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.name} type="button"
                    onClick={() => setFormData({...formData, selectedPlan: plan.name})}
                    className={`p-4 rounded-2xl border text-left transition-all ${formData.selectedPlan === plan.name ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                  >
                    <p className={`text-[8px] font-black uppercase truncate ${formData.selectedPlan === plan.name ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {plan.name.split(': ')[1]}
                    </p>
                    <p className="text-xs font-black mt-1 text-white">{plan.yield}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Principal Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">First Name</label>
                <input type="text" name="firstName" placeholder="EX: MARCUS" onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-800" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Last Name</label>
                <input type="text" name="lastName" placeholder="EX: THORNE" onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-800" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Institutional Email Address</label>
              <input type="email" name="email" placeholder="ADMIN@FIRM.COM" onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-800" />
            </div>

            {/* Security Protocol */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Primary Access Key</label>
                <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-800" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Verify Access Key</label>
                <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder-gray-800" />
              </div>
            </div>

            {/* Compliance Section */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl flex items-start gap-4">
              <input type="checkbox" checked={agreedToRisk} onChange={(e) => setAgreedToRisk(e.target.checked)} className="mt-1 accent-emerald-500 w-4 h-4 cursor-pointer" />
              <p className="text-[9px] text-gray-500 leading-relaxed uppercase font-black tracking-wider">
                I acknowledge the Institutional Risk Disclosure. I understand that asset growth is subject to market liquidity and systemic volatility. Past performance does not guarantee future alpha.
              </p>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-black font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl transition-all flex items-center justify-center gap-3 hover:bg-emerald-400 active:scale-[0.98] shadow-lg shadow-emerald-500/10">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] text-gray-600 uppercase tracking-[0.2em] font-black">
            Already have an active allocation? {' '}
            <Link to="/login" className="text-emerald-500 hover:underline decoration-emerald-500/30 underline-offset-4">Authorize Entry</Link>
          </p>
        </div>

        {/* Global Hub Notice */}
        <div className="mt-8 text-center text-[9px] font-black text-gray-700 uppercase tracking-[0.3em] flex items-center justify-center gap-4">
          <ShieldCheck size={14} className="text-emerald-500/40" />
          End-to-End Encrypted • SEC Digital Framework 2024
        </div>
      </motion.div>
    </div>
  );
}

