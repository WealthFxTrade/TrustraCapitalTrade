import React, { useState } from 'react';
import { createDeposit } from '../api';
import { ROI_PLANS } from '../constants/plans';
import toast from 'react-hot-toast';

export default function Invest() {
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(ROI_PLANS[0]);

  const handleInvestment = async (e) => {
    e.preventDefault();
    if (amount < selectedPlan.min) {
      return toast.error(`Minimum for ${selectedPlan.name} is $${selectedPlan.min}`);
    }

    try {
      await createDeposit({ amount, plan: selectedPlan.id });
      toast.success("Investment request submitted. Awaiting blockchain confirmation.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Investment failed");
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-blue-500">Select Investment Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {ROI_PLANS.map(plan => (
          <div 
            key={plan.id}
            onClick={() => setSelectedPlan(plan)}
            className={`p-6 rounded-xl border cursor-pointer transition ${selectedPlan.id === plan.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900'}`}
          >
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="text-3xl font-bold mt-2">{plan.roi}% <span className="text-sm font-normal">ROI</span></p>
            <p className="text-slate-400 text-sm mt-4">Min: ${plan.min.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleInvestment} className="max-w-md bg-slate-900 p-6 rounded-xl border border-slate-800">
        <label className="block mb-2 text-sm text-slate-400">Investment Amount (USD)</label>
        <input 
          type="number" 
          className="w-full bg-slate-800 border border-slate-700 p-3 rounded mb-4"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Min: $${selectedPlan.min}`}
        />
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition">
          Confirm {selectedPlan.name} Plan
        </button>
      </form>
    </div>
  );
}

