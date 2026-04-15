// src/pages/Dashboard/Withdrawal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight, 
  ShieldCheck,
  Loader2, 
  AlertTriangle, 
  Wallet, 
  Landmark, 
  Info, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../constants/api';
import toast from 'react-hot-toast';

export default function Withdrawal({ balances, refreshBalances }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    asset: 'USDT',
    walletType: 'ROI',
    address: '',
    network: 'TRC-20'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(formData.amount);
    const available = formData.walletType === 'ROI' ? (balances.ROI || 0) : (balances.EUR || 0);

    // Validation
    if (amount < 50) return toast.error('Minimum withdrawal threshold is €50.00');
    if (amount > available) return toast.error('Liquidity exceeds available node balance');
    if (!formData.address) return toast.error('Destination address or IBAN required');

    setSubmitting(true);
    const toastId = toast.loading("Initiating Security Audit...");

    try {
      // Matches backend: router.post('/withdraw', requestWithdrawal)
      const res = await api.post('/users/withdraw', formData);
      
      if (res.data?.success) {
        toast.success('Withdrawal queued for institutional audit', { id: toastId });
        
        // Refresh parent balances to show pending deduction
        await refreshBalances();
        
        // Redirect to Ledger to see the pending status
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Liquidation Request Failed';
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <header className="border-b border-white/5 pb-8">
        <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Asset Liquidation</h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">
          Node Status: <span className="text-emerald-500">Liquidity Sufficient</span>
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          
          {/* Source Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'ROI', label: 'Accrued ROI', val: balances.ROI || 0, icon: ArrowUpRight },
              { id: 'EUR', label: 'Principal AUM', val: balances.EUR || 0, icon: Wallet }
            ].map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setFormData(p => ({ ...p, walletType: w.id }))}
                className={`p-8 rounded-[2.5rem] border text-left transition-all relative overflow-hidden group ${
                  formData.walletType === w.id 
                    ? 'bg-emerald-500 border-emerald-500 text-black' 
                    : 'bg-black/20 border-white/5 text-white hover:border-white/20'
                }`}
              >
                <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${formData.walletType === w.id ? 'text-black/60' : 'text-gray-500'}`}>
                  {w.label}
                </p>
                <p className="text-3xl font-black italic tracking-tighter">
                  €{w.val.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
                <w.icon className={`absolute right-6 bottom-6 opacity-10 group-hover:scale-110 transition-transform`} size={48} />
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-black/20 border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Amount (EUR)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl text-xl font-black focus:border-emerald-500 outline-none transition-all text-white pr-16"
                    required
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-[10px] text-gray-600 uppercase">EUR</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Settlement Asset</label>
                <div className="relative">
                  <select
                    value={formData.asset}
                    onChange={(e) => setFormData(p => ({ ...p, asset: e.target.value }))}
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer text-white focus:border-emerald-500"
                  >
                    <option value="USDT">USDT (TRC-20)</option>
                    <option value="BTC">Bitcoin (Native)</option>
                    <option value="SEPA">Euro Bank Wire</option>
                  </select>
                  <ChevronRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">
                {formData.asset === 'SEPA' ? 'IBAN / Swift Details' : `Destination ${formData.asset} Address`}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                placeholder={formData.asset === 'SEPA' ? "DE00 0000..." : "Ox... or T..."}
                className="w-full bg-black border border-white/10 p-5 rounded-2xl text-xs font-mono focus:border-emerald-500 outline-none transition-all text-white"
                required
              />
            </div>

            <button
              disabled={submitting}
              className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
              {submitting ? "Processing Liquidation..." : "Execute Withdrawal Request"}
            </button>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
              <CheckCircle2 size={14} /> Audit Protocol
            </h4>
            <div className="space-y-4">
              {[
                { title: 'Processing Time', desc: 'Requests are audited within 2-24 hours for security.' },
                { title: 'Network Fees', desc: 'A fixed 1% liquidation fee applies to all external transfers.' },
                { title: 'Security Lock', desc: 'Large withdrawals may require secondary voice verification.' }
              ].map((item, i) => (
                <div key={i} className="border-l-2 border-emerald-500/20 pl-4 py-1">
                  <p className="text-[10px] font-black uppercase text-white tracking-widest">{item.title}</p>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] flex gap-4">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <p className="text-[10px] text-amber-200/60 font-medium leading-relaxed uppercase tracking-widest">
              Please verify your destination address carefully. Transfers to incorrect wallet addresses or bank accounts cannot be reversed by the vault node.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

