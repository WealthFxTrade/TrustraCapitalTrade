import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { RefreshCcw, ArrowDown, Wallet, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Exchange() {
  const { user, setUser } = useAuth();
  const [btcAmount, setBtcAmount] = useState('');
  const [eurResult, setEurResult] = useState(0);
  const [rate, setRate] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch live market rate for conversion
  useEffect(() => {
    const getRate = async () => {
      try {
        const { data } = await api.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
        setRate(data.bitcoin.eur);
      } catch (err) {
        toast.error("Oracle offline. Market rate unavailable.");
      }
    };
    getRate();
  }, []);

  // Update EUR preview as user types
  useEffect(() => {
    const amount = parseFloat(btcAmount) || 0;
    setEurResult(Number((amount * rate).toFixed(2)));
  }, [btcAmount, rate]);

  const handleSwap = async (e) => {
    e.preventDefault();
    if (!btcAmount || btcAmount <= 0) return toast.error("Enter a valid amount");
    if (btcAmount > (user?.balances?.BTC || 0)) return toast.error("Insufficient BTC Liquidity");

    setLoading(true);
    try {
      // Endpoint created in our previous backend session
      const { data } = await api.post('/exchange/btc-to-eur', { amount: parseFloat(btcAmount) });
      
      toast.success(`Success: €${eurResult.toLocaleString()} added to node`);
      setUser(data.user); // Update global auth state with new balances
      setBtcAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || "Exchange protocol failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 animate-in fade-in duration-700">
      <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Decorative Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none" />

        <h1 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3">
          <RefreshCcw className="text-yellow-500" /> Capital <span className="text-yellow-500">Swap</span>
        </h1>

        <form onSubmit={handleSwap} className="space-y-4">
          {/* BTC Input Area */}
          <div className="bg-black/40 p-6 rounded-3xl border border-white/10 group focus-within:border-yellow-500/30 transition-all">
            <div className="flex justify-between mb-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sell BTC</span>
              <span className="text-[10px] font-black text-yellow-500">Available: {user?.balances?.BTC || 0} BTC</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                step="any"
                value={btcAmount}
                onChange={(e) => setBtcAmount(e.target.value)}
                className="bg-transparent text-3xl font-bold w-full outline-none placeholder:text-gray-800"
                placeholder="0.000000"
              />
              <div className="bg-white/5 px-4 py-2 rounded-xl text-xs font-black">BTC</div>
            </div>
          </div>

          {/* Swap Divider */}
          <div className="flex justify-center -my-6 relative z-10">
            <div className="bg-yellow-500 text-black p-3 rounded-full border-4 border-[#0a0c10] shadow-xl">
              <ArrowDown size={20} strokeWidth={3} />
            </div>
          </div>

          {/* EUR Output Area */}
          <div className="bg-black/40 p-6 rounded-3xl border border-white/10 group">
            <div className="flex justify-between mb-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Receive EUR</span>
              <span className="text-[10px] font-black text-gray-500">Rate: €{rate.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold w-full text-white/50">
                {eurResult.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-xl text-xs font-black text-yellow-500">EUR</div>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-3 items-center">
            <AlertCircle size={16} className="text-yellow-500 shrink-0" />
            <p className="text-[10px] text-gray-500 leading-relaxed italic uppercase font-bold">
              Precision Swap: No hidden fees. Instant node credit.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading || !btcAmount}
            className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest rounded-[1.5rem] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCcw size={20} />}
            Confirm Exchange
          </button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <p className="text-[9px] text-gray-700 uppercase font-black tracking-[0.3em]">
          Secured by Trustra Multi-Sig Liquidity Pool
        </p>
      </div>
    </div>
  );
}
