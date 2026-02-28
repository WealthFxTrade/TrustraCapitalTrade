import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Zap, ShieldCheck, TrendingUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
  { name: 'Starter Node', min: 500, roi: '1.5%', duration: '30 Days' },
  { name: 'Pro Strategy', min: 2500, roi: '2.8%', duration: '60 Days' },
  { name: 'Institutional', min: 10000, roi: '4.5%', duration: '90 Days' }
];

export default function Invest() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);

  const handleInvest = async (plan) => {
    setLoading(plan.name);
    try {
      await api.post('/user/invest', { planName: plan.name, amount: plan.min });
      toast.success(`${plan.name} is now active!`);
      // Optional: Navigate to dashboard to see the active plan status
    } catch (err) {
      toast.error(err.response?.data?.message || "Investment failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Active <span className="text-yellow-500">Nodes</span></h1>
        <p className="text-gray-500 text-sm font-black uppercase tracking-widest mt-2">Select your ROI Protocol</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div key={plan.name} className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] flex flex-col hover:border-yellow-500/30 transition-all group">
            <div className="flex justify-between items-start mb-8">
              <div className="p-4 bg-yellow-500/10 rounded-2xl text-yellow-500">
                <Zap size={24} />
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase">Verified</span>
            </div>

            <h3 className="text-xl font-black uppercase mb-2">{plan.name}</h3>
            <p className="text-3xl font-bold mb-6">€{plan.min.toLocaleString()}</p>

            <div className="space-y-4 mb-8 flex-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 uppercase font-black">Daily ROI</span>
                <span className="text-white font-bold">{plan.roi}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 uppercase font-black">Cycle</span>
                <span className="text-white font-bold">{plan.duration}</span>
              </div>
            </div>

            <button 
              onClick={() => handleInvest(plan)}
              disabled={loading}
              className="w-full py-4 bg-white/5 group-hover:bg-yellow-500 group-hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {loading === plan.name ? <Loader2 className="animate-spin" size={16} /> : 'Initialize Node'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
