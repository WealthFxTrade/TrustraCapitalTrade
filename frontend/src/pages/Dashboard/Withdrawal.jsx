import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

export default function Withdrawal({ balances, refreshBalances }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    asset: 'USDT',
    walletType: 'EUR',           // Default to available EUR (safer)
    address: '',
  });

  // Current available balances from parent (Dashboard)
  const availableROI = Number(balances?.ROI || 0);
  const availableEUR = Number(balances?.EUR || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = Number(formData.amount);
    const available = formData.walletType === 'ROI' ? availableROI : availableEUR;

    // Validation
    if (!amount || amount < 50) {
      return toast.error('Minimum withdrawal amount is €50.00');
    }
    if (amount > available) {
      return toast.error('Requested amount exceeds available balance');
    }
    if (!formData.address.trim()) {
      return toast.error('Destination address or IBAN is required');
    }

    setSubmitting(true);
    const toastId = toast.loading("Initiating secure withdrawal...");

    try {
      const payload = {
        amount,
        address: formData.address.trim(),
        asset: formData.asset,
        walletType: formData.walletType,
      };

      const res = await api.post(API_ENDPOINTS.USER.WITHDRAW, payload);

      if (res.data?.success) {
        toast.success('Withdrawal request queued for institutional audit', { id: toastId });

        // Refresh balances in parent component
        if (refreshBalances) {
          await refreshBalances();
        }

        // Redirect back to dashboard / ledger after success
        setTimeout(() => navigate('/dashboard'), 1800);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Withdrawal request failed';
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="border-b border-white/5 pb-8">
        <h2 className="text-3xl font-black tracking-tighter uppercase italic">Asset Liquidation</h2>
        <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">
          Secure withdrawal from institutional node
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Form Section */}
        <div className="lg:col-span-7 space-y-8">
          {/* Source Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                id: 'EUR', 
                label: 'Available Principal', 
                val: availableEUR, 
                icon: Wallet 
              },
              { 
                id: 'ROI', 
                label: 'Accrued ROI', 
                val: availableROI, 
                icon: ArrowUpRight 
              },
            ].map((source) => (
              <button
                key={source.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, walletType: source.id }))}
                className={`p-8 rounded-3xl border text-left transition-all group relative overflow-hidden ${
                  formData.walletType === source.id
                    ? 'bg-emerald-500 border-emerald-500 text-black'
                    : 'bg-[#0a0c10] border-white/10 hover:border-white/30'
                }`}
              >
                <p className={`text-xs font-black uppercase tracking-widest mb-3 ${
                  formData.walletType === source.id ? 'text-black/70' : 'text-gray-500'
                }`}>
                  {source.label}
                </p>
                <p className="text-4xl font-black tracking-tighter">
                  €{source.val.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
                <source.icon 
                  className={`absolute bottom-6 right-6 opacity-20 group-hover:opacity-40 transition-all`} 
                  size={52} 
                />
              </button>
            ))}
          </div>

          {/* Withdrawal Form */}
          <form onSubmit={handleSubmit} className="bg-[#0a0c10] border border-white/10 rounded-3xl p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Amount */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Withdrawal Amount (EUR)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="50.00"
                    className="w-full bg-black border border-white/10 p-6 rounded-2xl text-2xl font-black focus:border-emerald-500 outline-none transition-colors"
                    required
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-600">EUR</span>
                </div>
              </div>

              {/* Asset */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Receive As</label>
                <select
                  value={formData.asset}
                  onChange={(e) => setFormData(prev => ({ ...prev, asset: e.target.value }))}
                  className="w-full bg-black border border-white/10 p-6 rounded-2xl text-sm font-bold uppercase tracking-widest focus:border-emerald-500 outline-none"
                >
                  <option value="USDT">USDT (TRC-20)</option>
                  <option value="BTC">Bitcoin</option>
                  <option value="SEPA">SEPA Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                {formData.asset === 'SEPA' ? 'IBAN / Bank Details' : `${formData.asset} Destination Address`}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder={formData.asset === 'SEPA' ? "DE89370400440532013000" : "0x... or bc1..."}
                className="w-full bg-black border border-white/10 p-6 rounded-2xl font-mono text-sm focus:border-emerald-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-7 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-black text-sm uppercase tracking-[1px] rounded-2xl transition-all flex items-center justify-center gap-3"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <ShieldCheck size={22} />
              )}
              {submitting ? "Processing Request..." : "Submit Withdrawal Request"}
            </button>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
            <h4 className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest">
              <CheckCircle2 size={16} /> Security & Processing
            </h4>
            <div className="space-y-5 text-sm">
              <div className="border-l-2 border-emerald-500/30 pl-5">
                <p className="font-medium">Audit Time</p>
                <p className="text-gray-500 text-xs">2 – 24 hours for security review</p>
              </div>
              <div className="border-l-2 border-emerald-500/30 pl-5">
                <p className="font-medium">Fees</p>
                <p className="text-gray-500 text-xs">Network fees + 1% liquidation fee apply</p>
              </div>
              <div className="border-l-2 border-emerald-500/30 pl-5">
                <p className="font-medium">Irreversible</p>
                <p className="text-gray-500 text-xs">Double-check destination before submitting</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-3xl">
            <div className="flex gap-4">
              <AlertTriangle className="text-amber-500 mt-1" size={24} />
              <div>
                <p className="font-medium text-amber-400">Important</p>
                <p className="text-xs text-amber-400/70 leading-relaxed mt-2">
                  Incorrect addresses or bank details cannot be recovered. All withdrawals undergo manual audit for security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
