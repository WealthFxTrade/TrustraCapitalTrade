import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Check, 
  X, 
  ArrowRight, 
  Wallet, 
  Cpu, 
  BarChart3, 
  Crown 
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
    benefit: 'Basic spot trading access',
    target: 'Beginners & Testing'
  },
  {
    name: 'Rio Basic',
    min: 1000,
    yield: '9–12%',
    icon: Zap,
    color: 'text-emerald-400',
    benefit: 'Advanced charts + Lower fees',
    target: 'Regular Investors'
  },
  {
    name: 'Rio Standard',
    min: 5000,
    yield: '12–16%',
    icon: Cpu,
    color: 'text-yellow-500',
    benefit: 'Priority support + Advanced tools',
    target: 'Reliability Seekers'
  },
  {
    name: 'Rio Advanced',
    min: 15000,
    yield: '16–20%',
    icon: BarChart3,
    color: 'text-blue-500',
    benefit: 'API access + Analytics',
    target: 'Active Traders & Devs'
  },
  {
    name: 'Rio Elite',
    min: 50000,
    yield: '20–25%',
    icon: Crown,
    color: 'text-purple-500',
    benefit: 'Institutional-grade features',
    target: 'High-Net-Worth'
  }
];

export default function InvestmentModal({ isOpen, onClose, userBalance, onUpdate }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInitialization = async () => {
    if (!selectedPlan) return toast.error("Please select a protocol.");
    if (userBalance < selectedPlan.min) {
      return toast.error(`Minimum requirement for ${selectedPlan.name} is €${selectedPlan.min.toLocaleString()}`);
    }

    setLoading(true);
    try {
      await api.post('/user/invest', {
        plan: selectedPlan.name,
        amount: selectedPlan.min
      });
      
      toast.success(`${selectedPlan.name} synchronized successfully.`);
      onUpdate(); // Triggers a re-fetch of user balance/assets
      onClose();
    } catch (err) {
      // Uses the ApiError logic we set up in the middleware
      toast.error(err.response?.data?.message || "Protocol handshake failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="relative w-full max-w-4xl bg-[#05070a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Header Area */}
            <div className="p-8 lg:p-12 border-b border-white/5 flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                  Asset Deployment
                </h2>
                <p className="text-[10px] font-bold text-yellow-500/60 uppercase tracking-[0.4em] mt-2">
                  Select a RIO Protocol to initiate yield generation
                </p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-all">
                <X size={24} className="text-white/40" />
              </button>
            </div>

            {/* Plan Grid */}
            <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {RIO_PLANS.map((plan) => (
                <button
                  key={plan.name}
                  onClick={() => setSelectedPlan(plan)}
                  className={`relative p-6 rounded-3xl border text-left transition-all duration-300 group ${
                    selectedPlan?.name === plan.name 
                    ? 'border-yellow-500 bg-yellow-500/5 ring-1 ring-yellow-500/50' 
                    : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <plan.icon size={22} className={`${plan.color}`} />
                    <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">{plan.target}</span>
                  </div>
                  
                  <h3 className="text-lg font-black italic uppercase text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black text-white">{plan.yield}</span>
                    <span className="text-[10px] font-bold opacity-30 uppercase">APY</span>
                  </div>

                  <p className="text-[11px] leading-relaxed opacity-50 mb-6 min-h-[32px]">
                    {plan.benefit}
                  </p>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Threshold</span>
                    <span className="text-sm font-black text-white">€{plan.min.toLocaleString()}</span>
                  </div>

                  {selectedPlan?.name === plan.name && (
                    <motion.div layoutId="check" className="absolute top-4 right-4 text-yellow-500">
                      <Check size={18} strokeWidth={4} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer / Action Area */}
            <div className="p-8 lg:p-12 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <Wallet size={24} className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Available Balance</p>
                  <p className="text-2xl font-black text-white">€{userBalance?.toLocaleString() || '0.00'}</p>
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <button
                  onClick={onClose}
                  className="flex-1 md:flex-none px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={loading || !selectedPlan}
                  onClick={handleInitialization}
                  className="flex-1 md:flex-none px-10 py-4 bg-white text-black rounded-full font-black uppercase italic text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-yellow-500 transition-all disabled:opacity-20"
                >
                  {loading ? 'Processing...' : 'Deploy Protocol'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
