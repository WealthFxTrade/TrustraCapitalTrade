// src/pages/Dashboard/Invest.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calculator } from 'lucide-react';
import api, { API_ENDPOINTS } from '@/api/api';
import toast from 'react-hot-toast';
import { calculateProfit } from '@/utils/investmentCalculator';

const INVESTMENT_PLANS = [
  { name: 'Tier I: Entry',       min: 100,   roi: '6–9%' },
  { name: 'Tier II: Core',       min: 1000,  roi: '9–12%' },
  { name: 'Tier III: Prime',     min: 5000,  roi: '12–16%' },
  { name: 'Tier IV: Institutional', min: 15000, roi: '16–20%' },
  { name: 'Tier V: Sovereign',   min: 50000, roi: '20–25%' },
];

export default function Invest({ balances = {}, refreshBalances }) {
  const [loading, setLoading] = useState(false);
  const [selectedPlanForCalc, setSelectedPlanForCalc] = useState(null);

  const availableEUR = Number(balances?.EUR || 0);
  const accruedProfit = Number(balances?.ROI || 0);
  const principal = Number(balances?.INVESTED || 0);

  // Calculate realistic returns for selected plan
  const getPlanProjection = (planName) => {
    if (!planName) return null;
    return calculateProfit({
      amount: 10000,           // Example base amount for display
      plan: planName,
      durationMonths: 12,
      compounding: 'daily'
    });
  };

  const handleInvest = async (plan) => {
    if (availableEUR < plan.min) {
      toast.error(`Minimum investment for \( {plan.name} is € \){plan.min.toLocaleString('de-DE')}`);
      return;
    }

    setLoading(true);
    const tid = toast.loading(`Activating ${plan.name}...`);

    try {
      const res = await api.post(API_ENDPOINTS.USER.COMPOUND || '/users/invest', {
        amount: plan.min,
        planName: plan.name,
        currency: 'EUR',
      });

      if (res.data?.success) {
        toast.success(`${plan.name} activated successfully!`, { id: tid });
        refreshBalances?.();
      } else {
        throw new Error(res.data?.message || 'Investment failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Investment failed. Please try again.', { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const handleCompound = async () => {
    if (accruedProfit < 10) {
      toast.error('Minimum €10 required to compound profit');
      return;
    }

    setLoading(true);
    const tid = toast.loading('Compounding profit...');

    try {
      const res = await api.post(API_ENDPOINTS.USER.COMPOUND);

      if (res.data?.success) {
        toast.success('Profit compounded successfully!', { id: tid });
        refreshBalances?.();
      } else {
        throw new Error(res.data?.message || 'Compounding failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Compounding failed.', { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Balance Overview */}
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
            className="mt-8 w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 text-black font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Compound Profit
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Principal Invested</p>
          <p className="text-5xl font-black mt-3">€{principal.toLocaleString('de-DE')}</p>
        </div>
      </div>

      {/* Investment Plans */}
      <div>
        <h3 className="text-xs uppercase text-gray-500 mb-6 flex items-center gap-2 tracking-widest font-bold">
          <TrendingUp size={16} className="text-emerald-500" /> INVESTMENT TIERS
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INVESTMENT_PLANS.map((plan) => {
            const canActivate = availableEUR >= plan.min;
            const projection = getPlanProjection(plan.name);

            return (
              <motion.div
                key={plan.name}
                whileHover={{ y: -4 }}
                className="bg-black border border-white/10 rounded-3xl p-8 hover:border-emerald-500/40 transition-all flex flex-col justify-between min-h-[420px]"
              >
                <div>
                  <p className="text-emerald-400 text-sm font-medium">{plan.roi} Annual Target</p>
                  <h4 className="text-2xl font-bold mt-3">{plan.name}</h4>

                  <div className="mt-8 space-y-4">
                    <div>
                      <p className="text-5xl font-black">€{plan.min.toLocaleString('de-DE')}</p>
                      <p className="text-xs text-gray-500">Minimum Investment</p>
                    </div>

                    {projection && (
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-400">Projected (1 Year)</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          +€{projection.monthlyProfit.toLocaleString('de-DE')} <span className="text-sm">/ month</span>
                        </p>
                      </div>
                    )}
                  </div>
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
                  {canActivate ? 'Activate This Plan' : `Minimum €${plan.min.toLocaleString('de-DE')}`}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
