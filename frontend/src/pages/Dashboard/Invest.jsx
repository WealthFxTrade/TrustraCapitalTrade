// frontend/src/pages/Dashboard/Invest.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, ArrowRight, ShieldCheck, Loader2,
  PlusCircle, Zap, LayoutDashboard, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

// Matches your backend RIO_DAILY_RATES keys exactly
const INVESTMENT_PLANS = [
  { name: 'Tier I: Entry', min: 250, rate: '0.02%', daily: 0.00020 },
  { name: 'Tier II: Core', min: 1000, rate: '0.028%', daily: 0.00028 },
  { name: 'Tier III: Prime', min: 5000, rate: '0.038%', daily: 0.00038 },
  { name: 'Tier IV: Institutional', min: 25000, rate: '0.049%', daily: 0.00049 },
];

export default function Invest({ balances, refreshBalances }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Synced with Backend keys
  const [localBalances, setLocalBalances] = useState({
    EUR: Number(balances?.EUR || 0),           // Available to spend
    TOTAL_PROFIT: Number(balances?.ROI || 0), // Accrued ROI
    INVESTED: Number(balances?.INVESTED || 0) // Principal locked
  });

  useEffect(() => {
    if (balances) {
      setLocalBalances({
        EUR: Number(balances.EUR || 0),
        TOTAL_PROFIT: Number(balances.ROI || 0),
        INVESTED: Number(balances.INVESTED || 0)
      });
    }
  }, [balances]);

  /**
   * CREATE NEW INVESTMENT (Buy Plan)
   */
  const handleInvest = async (plan) => {
    if (localBalances.EUR < plan.min) {
      toast.error(`Minimum for ${plan.name} is €${plan.min.toLocaleString()}`);
      return;
    }

    setLoading(true);
    const tid = toast.loading(`Activating ${plan.name}...`);

    try {
      const res = await api.post(API_ENDPOINTS.INVESTMENTS.BASE, {
        amount: plan.min,
        planName: plan.name,
        currency: 'EUR'
      });

      if (res.data.success) {
        toast.success(`${plan.name} Activated Successfully!`, { id: tid });
        if (refreshBalances) refreshBalances();
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Investment failed", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  /**
   * COMPOUND ROI (Move TOTAL_PROFIT to INVESTED)
   */
  const handleCompound = async () => {
    if (localBalances.TOTAL_PROFIT < 50) {
      toast.error("Minimum €50.00 in accrued profit required for compounding.");
      return;
    }

    setLoading(true);
    const tid = toast.loading("Executing compounding protocol...");

    try {
      const res = await api.post('/api/users/compound'); // Adjust to your actual compound route
      if (res.data.success) {
        toast.success("ROI compounded into Principal", { id: tid });
        if (refreshBalances) refreshBalances();
      }
    } catch (err) {
      toast.error("Compounding failed", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* SECTION 1: COMPANION BALANCES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Accrued Profit</p>
          <h2 className="text-5xl font-black tracking-tighter">€{localBalances.TOTAL_PROFIT.toLocaleString('de-DE')}</h2>
          <button 
            onClick={handleCompound}
            disabled={loading || localBalances.TOTAL_PROFIT < 50}
            className="mt-8 w-full py-4 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all disabled:opacity-30"
          >
            Compound into Principal
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Available for Investment</p>
          <h2 className="text-5xl font-black tracking-tighter">€{localBalances.EUR.toLocaleString('de-DE')}</h2>
          <p className="mt-4 text-xs text-gray-500">Inject liquidity via the Deposit tab to activate higher tiers.</p>
        </div>
      </div>

      {/* SECTION 2: INVESTMENT TIERS */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-8 flex items-center gap-3">
          <TrendingUp size={16} /> Available Capital Tiers
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {INVESTMENT_PLANS.map((plan) => (
            <motion.div 
              key={plan.name}
              whileHover={{ y: -5 }}
              className="bg-[#0a0c10] border border-white/10 p-8 rounded-3xl flex flex-col justify-between group hover:border-emerald-500/50 transition-all"
            >
              <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">{plan.rate} Daily Yield</p>
                <h4 className="text-xl font-black tracking-tight mb-2">{plan.name}</h4>
                <p className="text-2xl font-black text-white mb-6">€{plan.min.toLocaleString()}<span className="text-xs text-gray-600 font-medium"> min</span></p>
              </div>
              
              <button 
                onClick={() => handleInvest(plan)}
                disabled={loading || localBalances.EUR < plan.min}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  localBalances.EUR >= plan.min 
                  ? 'bg-white text-black hover:bg-emerald-500' 
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
                }`}
              >
                {localBalances.EUR >= plan.min ? 'Activate Node' : 'Insufficient EUR'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

