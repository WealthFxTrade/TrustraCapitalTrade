// src/components/invest/InvestmentModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Zap, Check, X, ArrowRight, Wallet, Cpu, BarChart3, Crown,
  AlertTriangle, Loader2,
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const RIO_PLANS = [
  {
    name: 'Rio Starter',
    min: 100,
    yield: '6–9%',
    icon: Shield,
    color: 'text-slate-400',
    benefit: 'Basic spot trading access + entry-level yield',
    target: 'Beginners & Testing',
  },
  {
    name: 'Rio Basic',
    min: 1000,
    yield: '9–12%',
    icon: Zap,
    color: 'text-emerald-400',
    benefit: 'Advanced charts + lower fees + priority queue',
    target: 'Regular Investors',
  },
  {
    name: 'Rio Standard',
    min: 5000,
    yield: '12–16%',
    icon: Cpu,
    color: 'text-yellow-500',
    benefit: 'Priority support + advanced tools + analytics',
    target: 'Reliability Seekers',
  },
  {
    name: 'Rio Advanced',
    min: 15000,
    yield: '16–20%',
    icon: BarChart3,
    color: 'text-blue-500',
    benefit: 'API access + full analytics + custom strategies',
    target: 'Active Traders & Developers',
  },
  {
    name: 'Rio Elite',
    min: 50000,
    yield: '20–25%',
    icon: Crown,
    color: 'text-purple-500',
    benefit: 'Institutional-grade features + dedicated support',
    target: 'High-Net-Worth Individuals',
  },
];

export default function InvestmentModal({ isOpen, onClose, userBalance = 0, onUpdate }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setCustomAmount(plan.min.toString()); // pre-fill minimum
    setErrors({});
  };

  const validateInvestment = () => {
    const newErrors = {};
    const amountNum = Number(customAmount);

    if (!selectedPlan) {
      newErrors.plan = 'Please select a protocol';
    }

    if (!customAmount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Enter a valid amount';
    } else if (amountNum < selectedPlan.min) {
      newErrors.amount = `Minimum for \( {selectedPlan.name} is € \){selectedPlan.min.toLocaleString()}`;
    } else if (amountNum > userBalance) {
      newErrors.amount = `Insufficient balance (available: €${userBalance.toLocaleString()})`;
    }

    if (!agreed) {
      newErrors.agreed = 'You must accept the risk disclosure';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitialization = async () => {
    if (!validateInvestment()) {
      toast.error('Please correct the errors above');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(`Deploying ${selectedPlan.name} protocol...`);

    try {
      const payload = {
        plan: selectedPlan.name,
        amount: Number(customAmount),
      };

      const res = await api.post('/user/invest', payload);

      toast.success(res.data.message || `${selectedPlan.name} successfully activated`, { id: toastId });
      if (onUpdate) onUpdate(); // refresh balances/ledger
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Protocol deployment failed';
      toast.error(msg, { id: toastId, duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 40 }}
            className="relative w-full max-w-5xl bg-[#05070a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 lg:p-12 border-b border-white/5 flex justify-between items-start">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-white">
                  Asset Deployment
                </h2>
                <p className="text-[10px] lg:text-xs font-bold text-yellow-500/70 uppercase tracking-[0.4em] mt-3">
                  Select RIO Protocol to activate yield generation
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                aria-label="Close modal"
              >
                <X size={24} className="text-white/60" />
              </button>
            </div>

            {/* Plan Grid */}
            <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar flex-1">
              {RIO_PLANS.map((plan) => (
                <button
                  key={plan.name}
                  onClick={() => handlePlanSelect(plan)}
                  className={`relative p-6 lg:p-8 rounded-3xl border text-left transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                    selectedPlan?.name === plan.name
                      ? 'border-yellow-500 bg-yellow-500/8 ring-1 ring-yellow-500/40 shadow-xl shadow-yellow-900/20'
                      : 'border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                  aria-pressed={selectedPlan?.name === plan.name}
                  aria-label={`Select ${plan.name} plan`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <plan.icon size={28} className={plan.color} />
                    <span className="text-[9px] lg:text-xs font-black opacity-50 uppercase tracking-widest">
                      {plan.target}
                    </span>
                  </div>

                  <h3 className="text-lg lg:text-xl font-black italic uppercase text-white mb-2">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl lg:text-3xl font-black text-white">{plan.yield}</span>
                    <span className="text-[10px] lg:text-xs font-bold opacity-40 uppercase">APY</span>
                  </div>

                  <p className="text-[11px] lg:text-sm leading-relaxed opacity-70 mb-6 min-h-[48px]">
                    {plan.benefit}
                  </p>

                  <div className="pt-4 border-t border-white/8 flex justify-between items-center">
                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                      Minimum Deployment
                    </span>
                    <span className="text-lg font-black text-white">
                      €{plan.min.toLocaleString()}
                    </span>
                  </div>

                  {selectedPlan?.name === plan.name && (
                    <motion.div
                      layoutId="selected-check"
                      className="absolute top-5 right-5 text-yellow-500 bg-black/50 rounded-full p-1.5 shadow-lg"
                    >
                      <Check size={20} strokeWidth={3} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer / Action Area */}
            <div className="p-8 lg:p-12 bg-white/[0.02] border-t border-white/8 flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Balance Preview */}
              <div className="flex items-center gap-5 w-full lg:w-auto">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <Wallet size={28} className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-xs font-bold opacity-50 uppercase tracking-widest">
                    Available Capital
                  </p>
                  <p className="text-2xl lg:text-3xl font-black text-white">
                    €{userBalance?.toLocaleString() || '0.00'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-10 py-5 rounded-full font-black uppercase text-[10px] lg:text-xs tracking-widest border border-white/10 hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  Cancel Deployment
                </button>

                <button
                  disabled={loading || !selectedPlan}
                  onClick={handleInitialization}
                  className={`flex-1 sm:flex-none px-12 py-5 rounded-full font-black uppercase text-[11px] lg:text-sm tracking-wider flex items-center justify-center gap-3 transition-all shadow-xl ${
                    loading || !selectedPlan
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Deploying...
                    </>
                  ) : (
                    <>
                      Deploy Protocol
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Risk Disclosure Checkbox */}
            <div className="px-8 lg:px-12 pb-8">
              <label className="flex items-start gap-3 text-[10px] lg:text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={() => {
                    setAgreed(!agreed);
                    setErrors((prev) => ({ ...prev, agreed: '' }));
                  }}
                  disabled={loading}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-black/50 focus:ring-yellow-500/50 accent-yellow-500"
                  aria-invalid={!!errors.agreed}
                />
                <span>
                  I understand this deployment is irreversible and involves market risk. Yield is not guaranteed. I accept the{' '}
                  <Link to="/risk-disclosure" className="text-yellow-500 hover:underline" target="_blank">
                    Risk Disclosure
                  </Link>.
                </span>
              </label>
              {errors.agreed && (
                <p className="text-rose-400 text-xs mt-2 ml-7">{errors.agreed}</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
