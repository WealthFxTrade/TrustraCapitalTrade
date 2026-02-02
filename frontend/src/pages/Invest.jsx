// src/pages/Invest.jsx
import React, { useState, useEffect } from 'react';
import { createDeposit } from '../api';
import toast from 'react-hot-toast';

const RIO_PLANS = [
  { id: 'starter', name: 'Rio Starter', roi: '6–9', min: 100, max: 999 },
  { id: 'basic', name: 'Rio Basic', roi: '9–12', min: 1000, max: 4999 },
  { id: 'standard', name: 'Rio Standard', roi: '12–16', min: 5000, max: 14999 },
  { id: 'advanced', name: 'Rio Advanced', roi: '16–20', min: 15000, max: 49999 },
  { id: 'elite', name: 'Rio Elite', roi: '20–25', min: 50000, max: Infinity },
];

export default function Invest() {
  const [selectedPlan, setSelectedPlan] = useState(RIO_PLANS[0]);
  const [amount, setAmount] = useState('');

  // Load plan from Dashboard click (stored in localStorage)
  useEffect(() => {
    const planId = localStorage.getItem('selectedPlan');
    if (planId) {
      const plan = RIO_PLANS.find(p => p.id === planId);
      if (plan) setSelectedPlan(plan);
    }
  }, []);

  const handleInvestment = async (e) => {
    e.preventDefault();
    if (!amount || amount < selectedPlan.min) {
      return toast.error(`Minimum for ${selectedPlan.name} is $${selectedPlan.min}`);
    }
    if (amount > selectedPlan.max) {
      return toast.error(`Maximum for ${selectedPlan.name} is $${selectedPlan.max}`);
    }

    try {
      await createDeposit({ amount, plan: selectedPlan.id });
      toast.success(`Investment in ${selectedPlan.name} submitted successfully!`);
      setAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Investment failed');
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-blue-500 text-center">Select Investment Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {RIO_PLANS.map(plan => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan)}
            className={`p-6 rounded-xl border cursor-pointer transition ${
              selectedPlan.id === plan.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-800 bg-slate-900'
            }`}
          >
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="text-3xl font-bold mt-2">{plan.roi}% <span className="text-sm font-normal">ROI</span></p>
            <p className="text-slate-400 text-sm mt-4">
              Min: ${plan.min.toLocaleString()} {plan.max !== Infinity && `- Max: $${plan.max.toLocaleString()}`}
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleInvestment}
        className="max-w-md mx-auto bg-slate-900 p-6 rounded-xl border border-slate-800"
      >
        <label className="block mb-2 text-sm text-slate-400">Investment Amount (USD)</label>
        <input
          type="number"
          className="w-full bg-slate-800 border border-slate-700 p-3 rounded mb-4 text-white"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Min: $${selectedPlan.min}${selectedPlan.max !== Infinity ? ` - Max: $${selectedPlan.max}` : ''}`}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition"
        >
          Confirm {selectedPlan.name} Plan
        </button>
      </form>
    </div>
  );
}
