import React, { useState } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { Wallet, ArrowUpRight, Loader2, ShieldCheck, Zap, ChevronRight } from 'lucide-react';

const WithdrawalRequest = ({ balances = {}, onAccountUpdate }) => {
  const [amount, setAmount] = useState('');
  const [walletType, setWalletType] = useState('ROI'); // Default to withdrawing yield
  const [asset, setAsset] = useState('BTC'); // Target settlement asset
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Available balance based on selected pool (ROI or EUR)
  const available = balances[walletType] || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Front-end Guardrails
    if (Number(amount) < 50) {
      return toast.error('Minimum redemption threshold: €50.00');
    }
    if (Number(amount) > available) {
      return toast.error(`Insufficient liquidity in ${walletType} vault`);
    }

    try {
      setLoading(true);
      const toastId = toast.loading('Authorizing Capital Redemption...');

      // Hits the /user/withdraw route we just built in the userController
      const { data } = await api.post('/user/withdraw', {
        amount: Number(amount),
        walletType, // Tells backend which pool to lock (EUR/ROI)
        asset,      // The crypto they want to receive (BTC/ETH/USDT)
        address
      });

      if (data.success) {
        toast.success('Protocol Initiated. Capital Locked for Verification.', { id: toastId });
        setAmount('');
        setAddress('');
        
        // Refresh dashboard balances to show the immediate deduction
        if (onAccountUpdate) onAccountUpdate();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal protocol failure', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <ArrowUpRight size={120} className="text-emerald-500" />
      </div>

      <header className="mb-10 space-y-2 relative z-10">
        <div className="flex items-center gap-2 text-emerald-500/60 mb-2">
          <Zap size={14} className="animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">Secure Redemption Terminal</span>
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tighter italic text-white">
          Request <span className="text-emerald-500 underline decoration-emerald-500/10 underline-offset-8">Liquidity</span>
        </h3>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        {/* SOURCE VAULT SELECTION */}
        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase text-gray-600 tracking-[0.3em] ml-2 italic">Source Liquidity Pool</label>
          <div className="grid grid-cols-2 gap-4">
            {['ROI', 'EUR'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setWalletType(type)}
                className={`p-5 rounded-2xl border transition-all flex flex-col items-start gap-1 group ${
                  walletType === type 
                  ? 'bg-emerald-600 border-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                  : 'bg-black/40 border-white/5 text-gray-500 hover:border-emerald-500/20'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{type === 'ROI' ? 'Yield Vault' : 'Principal Seed'}</span>
                <span className="text-sm font-mono font-black italic">
                  €{(balances[type] || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AMOUNT INPUT */}
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-gray-600 tracking-[0.3em] ml-2 italic">Redemption Value (€)</label>
            <div className="relative">
              <input 
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white font-mono placeholder:text-gray-800 focus:border-emerald-500/50 outline-none transition-all"
                required
              />
              <button 
                type="button"
                onClick={() => setAmount(available)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black bg-white/5 hover:bg-emerald-500 hover:text-black text-emerald-500 px-3 py-1.5 rounded-lg transition-all border border-emerald-500/20"
              >
                MAX
              </button>
            </div>
          </div>

          {/* ASSET SELECTION */}
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-gray-600 tracking-[0.3em] ml-2 italic">Settlement Asset</label>
            <select 
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white font-black uppercase tracking-widest outline-none focus:border-emerald-500/50 cursor-pointer appearance-none"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
            </select>
          </div>
        </div>

        {/* DESTINATION ADDRESS */}
        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase text-gray-600 tracking-[0.3em] ml-2 italic">Destination Wallet Address</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="bc1q..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white font-mono placeholder:text-gray-800 focus:border-emerald-500/50 outline-none transition-all"
              required
            />
            <Wallet className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-800" size={18} />
          </div>
        </div>

        {/* SECURITY NOTE */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex gap-4">
          <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
          <p className="text-[10px] text-gray-500 leading-relaxed font-black uppercase tracking-widest">
            Capital is locked immediately upon request. Zurich Treasury clearance typically resolves within <span className="text-emerald-500">2-6 hours</span>.
          </p>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all active:scale-[0.98] disabled:opacity-50 group"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>Finalize Authorization <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default WithdrawalRequest;
