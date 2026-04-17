// frontend/src/pages/Dashboard/Withdrawal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

export default function Withdrawal({ balances, refreshBalances }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    asset: 'USDT',
    walletType: 'EUR', // Matches DB: 'EUR' or 'ROI' (which Controller maps to TOTAL_PROFIT)
    address: '',
  });

  // Corrected mapping: Use 'ROI' for display, but logic maps to total accrued profit
  const availableROI = Number(balances?.ROI || 0);
  const availableEUR = Number(balances?.EUR || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = Number(formData.amount);
    const available = formData.walletType === 'ROI' ? availableROI : availableEUR;

    if (!amount || amount < 50) {
      return toast.error('Minimum liquidation is €50.00');
    }
    if (amount > available) {
      return toast.error('Amount exceeds available vault liquidity');
    }
    if (!formData.address.trim() || formData.address.length < 10) {
      return toast.error('Valid destination address is required');
    }

    setSubmitting(true);
    const toastId = toast.loading("Encrypting withdrawal request...");

    try {
      const payload = {
        amount,
        address: formData.address.trim(),
        asset: formData.asset,
        walletType: formData.walletType, // Backend handles the ROI -> TOTAL_PROFIT mapping
      };

      const res = await api.post(API_ENDPOINTS.USER.WITHDRAW, payload);

      if (res.data?.success) {
        toast.success('Liquidation queued for institutional audit', { id: toastId });
        if (refreshBalances) await refreshBalances();
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Liquidation failed';
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
            Asset <span className="text-rose-500">Liquidation</span>
          </h1>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">
            Protocol: Secure On-Chain Egress
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT: Selection & Form */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Source Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'EUR', label: 'Available Balance', val: availableEUR, icon: Wallet },
              { id: 'ROI', label: 'Accrued Profit', val: availableROI, icon: ArrowUpRight },
            ].map((source) => (
              <button
                key={source.id}
                type="button"
                onClick={() => setFormData({ ...formData, walletType: source.id })}
                className={`p-8 rounded-[32px] border text-left transition-all relative overflow-hidden group ${
                  formData.walletType === source.id
                    ? 'bg-white border-white text-black'
                    : 'bg-[#0a0c10] border-white/10 text-white hover:border-white/30'
                }`}
              >
                <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${
                  formData.walletType === source.id ? 'text-black/50' : 'text-gray-500'
                }`}>
                  {source.label}
                </p>
                <p className="text-4xl font-black tracking-tighter">
                  €{source.val.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
                <source.icon className="absolute -bottom-2 -right-2 opacity-10 group-hover:scale-110 transition-transform" size={80} />
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-[#0a0c10] border border-white/10 rounded-[40px] p-8 md:p-12 space-y-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Liquidation Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="50.00"
                    className="w-full bg-black border border-white/10 p-6 rounded-2xl text-2xl font-black focus:border-rose-500 outline-none transition-all"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-700">EUR</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Output Asset</label>
                <select
                  value={formData.asset}
                  onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                  className="w-full bg-black border border-white/10 p-6 h-[78px] rounded-2xl font-black uppercase text-xs tracking-widest focus:border-rose-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="USDT">USDT (ERC-20)</option>
                  <option value="BTC">Bitcoin (Native)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Destination {formData.asset} Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={`Enter your ${formData.asset} wallet address`}
                className="w-full bg-black border border-white/10 p-6 rounded-2xl font-mono text-sm focus:border-rose-500 outline-none transition-all"
              />
            </div>

            <button
              disabled={submitting}
              className="w-full py-6 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
              Confirm Secure Liquidation
            </button>
          </form>
        </div>

        {/* RIGHT: Audit Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-3">
              <Info size={16} /> Audit Protocol
            </h3>
            
            <div className="space-y-6">
              {[
                { title: 'Security Review', desc: 'All withdrawals undergo a 12-24h manual audit to prevent unauthorized access.' },
                { title: 'Network Fees', desc: 'A standard blockchain gas fee is deducted from the final output amount.' },
                { title: 'Finality', desc: 'On-chain transactions are immutable once broadcasted to the network.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                  <div>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex gap-3">
                <AlertTriangle className="text-rose-500 shrink-0" size={16} />
                <p className="text-[10px] text-rose-500/80 font-medium leading-tight">
                  Warning: Ensure your destination address matches the selected asset. Mistyped addresses will result in permanent loss.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

