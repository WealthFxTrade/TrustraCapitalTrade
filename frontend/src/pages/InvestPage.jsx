import React, { useState } from 'react';
import { Shield, TrendingUp, Clock, Zap, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/apiService';

const PLANS = [
  { id: 'TITAN', label: 'Titan Node', min: 100, roi: 1.5, duration: 30, color: 'from-blue-600 to-indigo-600' },
  { id: 'ELITE', label: 'Elite Node', min: 1000, roi: 2.2, duration: 60, color: 'from-purple-600 to-pink-600' },
  { id: 'ZENITH', label: 'Zenith Node', min: 5000, roi: 3.5, duration: 90, color: 'from-amber-500 to-orange-600' },
];

export default function InvestPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvest = async (e) => {
    e.preventDefault();
    if (!selectedPlan || !amount) return toast.error("Select plan and amount");
    
    setLoading(true);
    try {
      await api.post('/investments/create', {
        planName: selectedPlan.id,
        amount: parseFloat(amount),
        currency: 'EUR',
        dailyRoi: selectedPlan.roi,
        durationDays: selectedPlan.duration
      });
      toast.success("Investment Node Synchronized");
      setSelectedPlan(null);
      setAmount('');
    } catch (err) {
      toast.error(err.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Capital Deployment</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Active ROI Node Selection</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden group ${
                selectedPlan?.id === plan.id ? 'border-white/20 bg-white/5 shadow-2xl' : 'border-white/5 bg-black/40'
              }`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${plan.color}`}></div>
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${plan.color} opacity-80 group-hover:opacity-100 transition`}>
                  <Zap size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{plan.duration} Days</span>
              </div>
              <h3 className="text-2xl font-black uppercase mb-1">{plan.label}</h3>
              <p className="text-emerald-500 text-sm font-bold mb-6">{plan.roi}% Daily Yield</p>
              <div className="space-y-3 pt-6 border-t border-white/5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Min Entry</span>
                  <span className="text-white">€{plan.min}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Security</span>
                  <span className="text-white">Escrow Locked</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedPlan && (
          <form onSubmit={handleInvest} className="max-w-xl mx-auto bg-[#0a0d14] border border-white/5 p-10 rounded-[3rem] animate-in slide-in-from-bottom-4 transition duration-500">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2 italic">
              <Shield size={20} className="text-blue-500" /> Activate {selectedPlan.label}
            </h2>
            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2">Amount (EUR)</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min €${selectedPlan.min}`}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-xl font-black outline-none focus:border-blue-500 transition"
              />
              <button 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Sync Node Protocol"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

