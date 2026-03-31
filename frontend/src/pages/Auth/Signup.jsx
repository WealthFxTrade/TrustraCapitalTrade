import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2, ArrowRight, Lock } from 'lucide-react';
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
    selectedPlan: location.state?.plan || 'Rio Standard'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToRisk, setAgreedToRisk] = useState(false);

  const plans = [
    { name: 'Rio Starter', yield: '0.25%', min: '€100' },
    { name: 'Rio Basic', yield: '0.35%', min: '€1,000' },
    { name: 'Rio Standard', yield: '0.50%', min: '€5,000' },
    { name: 'Rio Advanced', yield: '0.65%', min: '€15,000' },
    { name: 'Rio Elite', yield: '0.85%', min: '€50,000' }
  ];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToRisk) return toast.error("Please acknowledge the Risk Disclosure to proceed.");
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
        toast.success("Account Provisioned. You may now log in.");
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Account Provisioning Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl z-10 py-12">
        <div className="flex flex-col items-center mb-10 text-center">
          <ShieldCheck className="text-emerald-500 mb-4" size={56} />
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">Create <span className="text-emerald-500">Investor Account</span></h1>
          <p className="text-[10px] font-black text-gray-500 tracking-[0.3em] mt-2 uppercase text-center">Private Wealth Management • Zurich Vault Secured</p>
        </div>

        <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Investment Protocol</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {plans.map((plan) => (
                  <button
                    key={plan.name} type="button"
                    onClick={() => setFormData({...formData, selectedPlan: plan.name})}
                    className={`p-3 rounded-xl border text-left transition-all ${formData.selectedPlan === plan.name ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                  >
                    <p className={`text-[8px] font-black uppercase truncate ${formData.selectedPlan === plan.name ? 'text-emerald-400' : 'text-gray-500'}`}>{plan.name.replace('Rio ', '')}</p>
                    <p className="text-sm font-black mt-1">{plan.yield}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="firstName" placeholder="FIRST NAME" onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:border-emerald-500/50 outline-none placeholder-gray-800" />
              <input type="text" name="lastName" placeholder="LAST NAME" onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:border-emerald-500/50 outline-none placeholder-gray-800" />
            </div>

            <input type="email" name="email" placeholder="INSTITUTIONAL EMAIL" onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:border-emerald-500/50 outline-none placeholder-gray-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="password" name="password" placeholder="ACCESS KEY" onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:border-emerald-500/50 outline-none placeholder-gray-800" />
              <input type="password" name="confirmPassword" placeholder="CONFIRM ACCESS KEY" onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:border-emerald-500/50 outline-none placeholder-gray-800" />
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl flex items-start gap-4">
              <input type="checkbox" checked={agreedToRisk} onChange={(e) => setAgreedToRisk(e.target.checked)} className="mt-1 accent-emerald-500" />
              <p className="text-[10px] text-gray-400 leading-relaxed uppercase font-medium">I acknowledge the Risk Disclosure statement. I understand that capital growth is performance-based and subject to market conditions.</p>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-white text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all flex items-center justify-center gap-3 hover:bg-emerald-500 active:scale-[0.98]">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-500 uppercase tracking-widest font-bold">Already a client? <Link to="/login" className="text-emerald-500">Authorize Entry</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
