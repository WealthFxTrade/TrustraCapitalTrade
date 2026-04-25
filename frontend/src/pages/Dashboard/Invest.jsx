// src/pages/Dashboard/Invest.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

const INVESTMENT_PLANS = [
  { name: 'Tier I: Entry', min: 100, daily: 0.00020, roi: '6–9%' },
  { name: 'Tier II: Core', min: 1000, daily: 0.00028, roi: '9–12%' },
  { name: 'Tier III: Prime', min: 5000, daily: 0.00038, roi: '12–16%' },
  { name: 'Tier IV: Institutional', min: 15000, daily: 0.00049, roi: '16–20%' },
  { name: 'Tier V: Sovereign', min: 50000, daily: 0.00061, roi: '20–25%' },
];

export default function Invest({ balances, refreshBalances }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const availableEUR = Number(balances?.EUR || 0);
  const accruedProfit = Number(balances?.ROI || 0);
  const principal = Number(balances?.INVESTED || 0);

  const handleInvest = async (plan) => {
    if (availableEUR < plan.min) {
      toast.error(`Minimum investment for \( {plan.name} is € \){plan.min.toLocaleString()}`);
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

      if (res.data?.success) {
        toast.success(`${plan.name} activated successfully!`, { id: tid });
        refreshBalances?.();
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Investment failed', { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const handleCompound = async () => {
    if (accruedProfit < 10) {
      toast.error('Minimum €10 required to compound');
      return;
    }

    setLoading(true);
    const tid = toast.loading('Compounding profit...');

    try {
      const res = await api.post('/api/users/compound');
      if (res.data?.success) {
        toast.success('Profit compounded successfully!', { id: tid });
        refreshBalances?.();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Compounding failed', { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Available Capital</p>
          <p className="text-5xl font-black mt-3">€{availableEUR.toLocaleString('de-DE')}</p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-8">
          <p className="text-xs text-emerald-500 uppercase tracking-widest">Accrued Profit</p>
          <p className="text-5xl font-black text-emerald-400 mt-3">€{accruedProfit.toLocaleString('de-DE')}</p>

          <button
            onClick={handleCompound}
            disabled={loading || accruedProfit < 10}
            className="mt-8 w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 text-black font-bold rounded-2xl transition"
          >
            Compound Profit
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Principal Invested</p>
          <p className="text-5xl font-black mt-3">€{principal.toLocaleString('de-DE')}</p>
        </div>
      </div>

      {/* Investment Tiers */}
      <div>
        <h3 className="text-xs uppercase text-gray-500 mb-6 flex items-center gap-2">
          <TrendingUp size={16} /> CAPITAL TIERS
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INVESTMENT_PLANS.map((plan) => {
            const canActivate = availableEUR >= plan.min;

            return (
              <motion.div
                key={plan.name}
                whileHover={{ y: -4 }}
                className="bg-black border border-white/10 rounded-3xl p-8 hover:border-emerald-500/40 transition-all"
              >
                <p className="text-emerald-400 text-sm">{plan.roi} Annual ROI</p>
                <h4 className="text-2xl font-bold mt-3">{plan.name}</h4>

                <div className="mt-8">
                  <p className="text-5xl font-black">€{plan.min.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Daily Yield: {(plan.daily * 100).toFixed(3)}%
                  </p>
                </div>

                <button
                  onClick={() => handleInvest(plan)}
                  disabled={!canActivate || loading}
                  className={`mt-10 w-full py-4 rounded-2xl text-sm font-bold transition-all ${
                    canActivate 
                      ? 'bg-white text-black hover:bg-emerald-500 hover:text-white' 
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canActivate ? 'Activate Plan' : 'Insufficient Balance'}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
