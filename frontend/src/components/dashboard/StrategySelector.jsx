import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, Zap, ShieldCheck, Crown, Loader2, Lock } from 'lucide-react';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

const PLANS = [
  { id: 'entry', name: 'Entry', roi: '6–9%', minimum: 100, description: 'Diversified Liquidity Access', color: 'blue', icon: LayoutDashboard },
  { id: 'core', name: 'Core', roi: '9–12%', minimum: 1000, description: 'Enhanced Execution & Smart Routing', color: 'emerald', icon: PlusCircle },
  { id: 'prime', name: 'Prime', roi: '12–16%', minimum: 5000, description: 'Priority Order Execution & Rebalancing', color: 'yellow', icon: Zap },
  { id: 'institutional', name: 'Institutional', roi: '16–20%', minimum: 15000, description: 'Dedicated Asset Validation & Governance', color: 'orange', icon: ShieldCheck },
  { id: 'sovereign', name: 'Sovereign', roi: '20–25%', minimum: 50000, description: 'HFT Arbitrage & Institutional Dark Pools', color: 'red', icon: Crown }
];

const colorMap = {
  blue: 'text-blue-500 bg-blue-500/10',
  emerald: 'text-emerald-500 bg-emerald-500/10',
  yellow: 'text-yellow-500 bg-yellow-500/10',
  orange: 'text-orange-500 bg-orange-500/10',
  red: 'text-red-500 bg-red-500/10'
};

export default function StrategySelector({ balances, onAllocationComplete }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleDeploy = async (plan) => {
    // 1. Confirm Intent
    const confirmMsg = `Initialize ${plan.name} Protocol? €${plan.minimum.toLocaleString()} will be locked for the duration of the strategy.`;
    if (!window.confirm(confirmMsg)) return;

    setLoadingId(plan.id);
    const toastId = toast.loading(`Authorizing ${plan.name} Strategy...`);

    try {
      // 2. Execute Backend Subscription
      const res = await api.post(`${API_ENDPOINTS.INVESTMENTS.SUBSCRIBE}/${plan.id}`);

      if (res.data.success) {
        toast.success(`${plan.name} Protocol Active`, { id: toastId });
        if (onAllocationComplete) onAllocationComplete(res.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Execution Failed: Server Timeout';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {PLANS.map((plan) => {
        const Icon = plan.icon;
        const canAfford = (balances?.EUR || 0) >= plan.minimum;
        const isLoading = loadingId === plan.id;

        return (
          <div
            key={plan.id}
            className={`bg-[#0a0c10] border p-8 rounded-[40px] transition-all flex flex-col justify-between group
              ${canAfford 
                ? 'border-white/5 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5' 
                : 'border-white/5 opacity-40 grayscale pointer-events-none'}`}
          >
            <div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${colorMap[plan.color]}`}>
                <Icon size={28} />
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold tracking-tight text-white">{plan.name}</h3>
                {!canAfford && <Lock size={14} className="text-gray-600 mt-2" />}
              </div>
              
              <p className="text-emerald-500 font-black text-xl mb-4 tracking-tighter">{plan.roi} APY</p>
              <p className="text-gray-400 text-[11px] leading-relaxed font-medium mb-6">{plan.description}</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Min. Principal</span>
                  <span className="text-[11px] font-bold text-white">€{plan.minimum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Settlement</span>
                  <span className="text-[11px] font-bold text-white">Instant</span>
                </div>
              </div>
            </div>

            <button
              disabled={!canAfford || isLoading}
              onClick={() => handleDeploy(plan)}
              className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                ${canAfford 
                  ? 'bg-white/5 border border-white/10 hover:bg-white hover:text-black shadow-lg' 
                  : 'bg-transparent border-gray-800 text-gray-600'}`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : canAfford ? (
                'Deploy Capital'
              ) : (
                `Min. €${plan.minimum.toLocaleString()} Req.`
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

