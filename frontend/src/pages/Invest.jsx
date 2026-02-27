// src/pages/Invest.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, ArrowRight, Info, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { API_ENDPOINTS } from '../constants/api';

const plans = [
  { id: 'starter', name: 'Starter', min: 100, max: 999 },
  { id: 'basic', name: 'Basic', min: 1000, max: 4999 },
  { id: 'standard', name: 'Standard', min: 5000, max: 14999 },
  { id: 'advanced', name: 'Advanced', min: 15000, max: 49999 },
  { id: 'elite', name: 'Elite', min: 50000, max: Infinity },
];

export default function Invest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const availableBalance = Number(user?.balance || 0);
  const numericAmount = Number(amount) || 0;

  const handleInvestment = async (e) => {
    e.preventDefault();

    if (numericAmount < selectedPlan.min) {
      return toast.error(`Minimum amount is €${selectedPlan.min}`);
    }
    if (selectedPlan.max !== Infinity && numericAmount > selectedPlan.max) {
      return toast.error(`Maximum amount is €${selectedPlan.max}`);
    }
    if (numericAmount > availableBalance) {
      return toast.error('Insufficient balance');
    }

    if (
      !confirm(
        `Confirm investment of €${numericAmount.toFixed(2)} in ${selectedPlan.name} plan? This is subject to market risk.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const endpoint = API_ENDPOINTS.INVESTMENTS || '/plans/invest';
      const res = await api.post(endpoint, {
        planId: selectedPlan.id,
        amount: numericAmount,
      });

      if (res.data?.success) {
        toast.success('Investment submitted successfully');
        navigate('/dashboard');
      } else {
        toast.error('Investment failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process investment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 animate-in fade-in duration-700">
      {/* High Risk Warning */}
      <div className="bg-red-900/30 border border-red-500/50 rounded-3xl p-6 mb-8 flex items-start gap-4 max-w-4xl mx-auto">
        <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={28} />
        <div>
          <h4 className="font-bold text-red-300 mb-2">High Risk Warning</h4>
          <p className="text-red-200 text-sm leading-relaxed">
            Cryptocurrency investments carry significant risk of loss. Returns are not guaranteed and can be negative. Only invest what you can afford to lose.
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Investment Plans</h1>
        <p className="text-gray-500 text-sm mt-2">
          Explore available options — all investments are subject to market conditions.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Plan Selector + Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlan(p)}
                className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                  selectedPlan.id === p.id
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
                    : 'border-white/5 bg-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <p className="text-[8px] font-black uppercase mb-1 tracking-tighter text-slate-400">{p.name}</p>
                <p className="text-lg font-black italic">
                  €{p.min} – {p.max === Infinity ? '∞' : `€${p.max}`}
                </p>
              </button>
            ))}
          </div>

          {/* Investment Form */}
          <form
            onSubmit={handleInvestment}
            className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl"
          >
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4 px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Amount to Invest (€)
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(availableBalance.toString())}
                  className="text-[9px] font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-widest"
                >
                  Max Available: €{availableBalance.toLocaleString()}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-black text-indigo-500 italic">€</span>
                <input
                  type="number"
                  step="0.01"
                  min={selectedPlan.min}
                  max={selectedPlan.max === Infinity ? undefined : selectedPlan.max}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black/60 border border-white/5 rounded-[2rem] py-8 pl-16 pr-8 text-4xl font-black outline-none focus:border-indigo-500/50 transition-all font-mono"
                />
              </div>
            </div>

            <button
              disabled={
                loading ||
                !amount ||
                numericAmount < selectedPlan.min ||
                (selectedPlan.max !== Infinity && numericAmount > selectedPlan.max) ||
                numericAmount > availableBalance
              }
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-6 rounded-2xl font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-900/30"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Processing...
                </>
              ) : (
                <>
                  Confirm Investment <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Side Info */}
        <div className="space-y-6">
          <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex gap-4">
            <Info className="text-indigo-500 shrink-0" size={20} />
            <p className="text-[9px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
              Investments are subject to market risk. Past performance is not indicative of future results.
            </p>
          </div>

          <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] flex gap-4">
            <ShieldCheck className="text-indigo-400 shrink-0" size={20} />
            <p className="text-[9px] text-indigo-300 leading-relaxed uppercase tracking-widest font-bold">
              All transactions are logged and secured. Verify details before confirming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
