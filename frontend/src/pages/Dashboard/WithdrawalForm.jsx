import React, { useState } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { 
  ArrowUpRight, 
  ShieldCheck, 
  Wallet, 
  Loader2, 
  Lock, 
  ChevronRight, 
  Info,
  AlertTriangle
} from 'lucide-react';

export default function WithdrawalForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    asset: 'BTC',
    address: '',
    walletType: 'main'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-Side Validation
    if (!formData.amount || Number(formData.amount) < 50) {
      return toast.error("Minimum withdrawal is €50.00");
    }
    if (formData.address.length < 25) {
      return toast.error(`Please enter a valid ${formData.asset} address`);
    }

    setLoading(true);
    try {
      // 2. Transmit to Trustra Security Node
      // Targets router.post('/withdraw/request') in your backend
      const res = await api.post('/user/withdraw', formData);

      toast.success(res.data.message || "Withdrawal Transmitted");

      // 3. Reset Form on Success
      setFormData({ ...formData, amount: '', address: '' });

      // Trigger parent refresh (to update balance/ledger)
      if (onSuccess) onSuccess();

    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-10 bg-[#0f121d] rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Lock size={120} />
      </div>

      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3">
            <ArrowUpRight className="text-rose-500" strokeWidth={3} /> Capital <span className="text-rose-500">Release</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Outbound Gateway v2.5.3</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
          <ShieldCheck size={12} className="text-emerald-500" /> Secure Node
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        {/* WALLET SELECTION */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Source Liquidity</label>
          <div className="grid grid-cols-2 gap-4">
            {['main', 'profit'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, walletType: type })}
                className={`p-5 rounded-2xl border transition-all uppercase text-[10px] font-black tracking-widest flex flex-col items-center gap-3 ${
                  formData.walletType === type
                    ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-600/20 text-white'
                    : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <Wallet size={18} />
                {type} Wallet
              </button>
            ))}
          </div>
        </div>

        {/* ASSET SELECTION */}
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-4 ml-1">
            Gateway Asset
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['BTC', 'ETH', 'USDT'].map((crypto) => (
              <button
                key={crypto}
                type="button"
                onClick={() => setFormData({ ...formData, asset: crypto })}
                className={`py-3 rounded-xl border font-black text-[10px] tracking-widest transition-all ${
                  formData.asset === crypto 
                    ? 'bg-white text-black border-white' 
                    : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'
                }`}
              >
                {crypto}
              </button>
            ))}
          </div>
        </div>

        {/* AMOUNT & ADDRESS */}
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2 mb-2 block">Withdrawal Amount (EUR)</label>
            <div className="relative">
              <input
                type="number"
                placeholder="Min. 50.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-[#0a0d14] border border-white/5 p-5 rounded-2xl font-mono text-xl text-indigo-400 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-800"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-700 uppercase">EUR</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2 mb-2 block">Destination {formData.asset} Address</label>
            <input
              type="text"
              placeholder={`Paste your ${formData.asset} address...`}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-[#0a0d14] border border-white/5 p-5 rounded-2xl font-mono text-[11px] text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-800"
            />
          </div>
        </div>

        {/* PROTOCOL INFO */}
        <div className="bg-rose-500/5 border border-rose-500/10 p-5 rounded-2xl flex items-start gap-4">
          <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-1" />
          <p className="text-[9px] font-bold text-rose-400 uppercase leading-relaxed tracking-tighter">
            Confirm destination address. External node releases are irreversible. 
            Processing time: 10–60 minutes.
          </p>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black py-6 rounded-2xl font-black text-xs tracking-[0.4em] uppercase hover:bg-rose-600 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group/btn"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              Initialize Protocol
              <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
      
      <footer className="mt-8 text-center">
        <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.5em]">
          End-to-End Encryption Enabled // AES-256
        </p>
      </footer>
    </div>
  );
}

