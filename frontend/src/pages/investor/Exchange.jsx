import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { ArrowDown, RefreshCcw, Wallet, Info } from 'lucide-react';

export default function Exchange() {
  const { stats, fetchStats } = useUser();
  const [btcAmount, setBtcAmount] = useState('');
  const [btcPrice, setBtcPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Live Price for Calculation
  useEffect(() => {
    const getPrice = async () => {
      const res = await fetch('https://api.coingecko.com');
      const data = await res.json();
      setBtcPrice(data.bitcoin.eur);
    };
    getPrice();
  }, []);

  const eurOutput = btcAmount ? (parseFloat(btcAmount) * btcPrice).toFixed(2) : '0.00';

  const handleExchange = async (e) => {
    e.preventDefault();
    if (!btcAmount || btcAmount <= 0) return toast.error("Enter a valid amount");
    if (btcAmount > stats.balances.BTC) return toast.error("Insufficient BTC balance");

    setLoading(true);
    try {
      const res = await api.post('/investment/exchange', { btcAmount: parseFloat(btcAmount) });
      toast.success(`Successfully swapped for €${eurOutput}`);
      setBtcAmount('');
      fetchStats(); // Update UI balances immediately
    } catch (err) {
      toast.error(err.response?.data?.message || "Exchange Protocol Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#020617] min-h-screen text-white flex flex-col items-center">
      <header className="mb-10 w-full max-w-lg">
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-2">Liquidity Bridge</p>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">BTC <span className="text-slate-800">/</span> EUR Exchange</h1>
      </header>

      <div className="w-full max-w-lg bg-[#0f172a]/40 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-2xl shadow-3xl">
        <form onSubmit={handleExchange} className="space-y-4">
          
          {/* FROM: BTC */}
          <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-4">
              <span>Sell BTC</span>
              <span>Available: {stats.balances.BTC.toFixed(8)} BTC</span>
            </div>
            <div className="flex items-center justify-between">
              <input 
                type="number" 
                step="any"
                placeholder="0.00"
                className="bg-transparent text-2xl font-black outline-none w-full placeholder:text-slate-800"
                value={btcAmount}
                onChange={(e) => setBtcAmount(e.target.value)}
              />
              <span className="text-yellow-500 font-black italic">BTC</span>
            </div>
          </div>

          {/* SWAP ICON */}
          <div className="flex justify-center -my-6 relative z-10">
            <div className="bg-indigo-600 p-3 rounded-xl border-4 border-[#020617] hover:rotate-180 transition-transform duration-500">
              <ArrowDown size={20} />
            </div>
          </div>

          {/* TO: EUR */}
          <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-4">
              <span>Receive EUR (Estimated)</span>
              <span>Rate: €{btcPrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-black text-slate-400">€{eurOutput}</div>
              <span className="text-indigo-500 font-black italic">EUR</span>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading || !btcAmount}
            className="w-full bg-white text-black hover:bg-indigo-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? <RefreshCcw className="animate-spin" /> : 'Execute Swap'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex gap-3">
          <Info className="text-indigo-500 shrink-0" size={18} />
          <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase">
            Funds are swapped instantly at market rate. Swapped EUR will be available in your Equity balance for Node Activation.
          </p>
        </div>
      </div>
    </div>
  );
}

