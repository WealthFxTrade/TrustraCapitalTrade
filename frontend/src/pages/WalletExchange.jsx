import React, { useState } from 'react';
import { ArrowRightLeft, Wallet, RefreshCw, TrendingUp, ChevronDown, ShieldCheck } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../constants/api';

export default function WalletExchange() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExchange = async (e) => {
    e.preventDefault();

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return toast.error('Enter a valid amount greater than 0');
    }

    if (!confirm(`Confirm reinvestment/transfer of €${numAmount.toFixed(2)}? This action moves funds internally and cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const endpoint = API_ENDPOINTS.TRANSACTIONS || '/transactions/reinvest';
      await api.post(endpoint, { amount: numAmount });

      toast.success('Transfer completed successfully');
      setAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-6 md:p-12 flex items-center justify-center">
      <div className="w-full max-w-xl bg-[#0f1218] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl" />

        <header className="relative mb-10 text-center">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            Internal Transfer
          </h2>
          <p className="text-gray-500 text-xs font-medium mt-2">
            Move funds between your internal wallets
          </p>
        </header>

        {/* Warning */}
        <div className="bg-amber-900/30 border border-amber-500/50 rounded-3xl p-6 mb-8 flex items-start gap-4">
          <AlertTriangle className="text-amber-400 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-bold text-amber-300 mb-2">Important</h4>
            <p className="text-amber-200 text-sm leading-relaxed">
              Transfers are internal and irreversible. Double-check amounts before confirming. This feature is for demonstration only.
            </p>
          </div>
        </div>

        {/* Exchange UI */}
        <div className="space-y-8 relative">
          {/* From */}
          <div className="bg-black/40 border border-white/5 p-6 rounded-[1.5rem] group hover:border-white/10 transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">From</span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Profit Wallet</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp size={24} className="text-emerald-500" />
                <span className="text-2xl font-black tracking-tight italic">EUR</span>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-gray-600 uppercase">Available</p>
                <p className="font-mono font-bold text-gray-300">Balance: Loading...</p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-indigo-600 p-3 rounded-xl border-4 border-[#0f1218] shadow-lg text-white">
              <ArrowRightLeft size={20} />
            </div>
          </div>

          {/* To */}
          <div className="bg-black/40 border border-white/5 p-6 rounded-[1.5rem] group hover:border-white/10 transition-all pt-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">To</span>
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded">Main Wallet</span>
            </div>
            <div className="flex items-center gap-3">
              <Wallet size={24} className="text-indigo-500" />
              <span className="text-2xl font-black tracking-tight italic">EUR</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleExchange} className="mt-8 space-y-6">
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-black/60 border border-white/5 p-6 rounded-2xl font-mono text-3xl font-black text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-gray-800"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 font-black text-xl italic">€</div>
          </div>

          <button
            type="submit"
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full bg-white text-black hover:bg-indigo-500 hover:text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              'Confirm Transfer'
            )}
          </button>
        </form>

        <footer className="mt-10 text-center">
          <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.3em]">
            Internal transfer only • No external wallets involved
          </p>
        </footer>
      </div>
    </div>
  );
}
