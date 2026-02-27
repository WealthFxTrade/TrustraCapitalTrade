// src/pages/InvestConfirm.jsx - Production v8.4.1
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Loader2, ArrowRight } from 'lucide-react';
import api from '../api/api';
import { API_ENDPOINTS } from '../constants/api';
import toast from 'react-hot-toast';

export default function InvestConfirm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isDeploying, setIsDeploying] = useState(false);

  if (!state?.planKey || !state?.amount) {
    navigate('/plans');
    return null;
  }

  const handleFinalize = async () => {
    setIsDeploying(true);
    try {
      await api.post(API_ENDPOINTS.INVESTMENT.CREATE, {
        planKey: state.planKey,
        amount: state.amount
      });
      
      toast.success("Node Deployed Successfully");
      navigate('/investments');
    } catch (err) {
      toast.error(err.response?.data?.message || "Deployment Failed");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0a0c10] border border-white/10 rounded-[3rem] p-10 text-center shadow-3xl">
        <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <ShieldCheck className="text-indigo-500" size={40} />
        </div>

        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Audit Confirmation</h2>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10">Review Final Deployment</p>

        <div className="space-y-4 mb-10 text-left">
          <div className="flex justify-between py-4 border-b border-white/5">
            <span className="text-[10px] font-black text-gray-500 uppercase">Tier</span>
            <span className="text-sm font-black uppercase italic">{state.planKey}</span>
          </div>
          <div className="flex justify-between py-4 border-b border-white/5">
            <span className="text-[10px] font-black text-gray-500 uppercase">Principal</span>
            <span className="text-sm font-black">€{state.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-4">
            <span className="text-[10px] font-black text-gray-500 uppercase">Network Fee</span>
            <span className="text-sm font-black text-emerald-500">€0.00 (Standard)</span>
          </div>
        </div>

        <button 
          onClick={handleFinalize}
          disabled={isDeploying}
          className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
        >
          {isDeploying ? <Loader2 className="animate-spin" size={20} /> : <><Lock size={18} /> CONFIRM DEPLOYMENT</>}
        </button>

        <p className="mt-8 text-[9px] text-gray-700 uppercase font-black tracking-[0.3em]">
          By confirming, you authorize the Trustra Node to allocate €{state.amount} to high-frequency market placement.
        </p>
      </div>
    </div>
  );
}

