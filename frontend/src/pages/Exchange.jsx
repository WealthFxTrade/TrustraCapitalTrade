import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Repeat, ArrowDown, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Exchange() {
  const { user } = useAuth();
  const [btcInput, setBtcInput] = useState('');
  const [eurPreview, setEurPreview] = useState(0);
  const [rate, setRate] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch current market rate on mount
  useEffect(() => {
    const getRate = async () => {
      try {
        const { data } = await api.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
        setRate(data.bitcoin.eur);
      } catch (err) {
        console.error("Oracle sync failed");
      }
    };
    getRate();
  }, []);

  useEffect(() => {
    setEurPreview(Number(btcInput) * rate);
  }, [btcInput, rate]);

  const executeSwap = async () => {
    if (!btcInput || btcInput <= 0) return toast.error("Enter amount");
    setLoading(true);
    try {
      const { data } = await api.post('/user/exchange', { btcAmount: parseFloat(btcInput) });
      toast.success(data.message);
      setBtcInput('');
      // The socket.io listener in App.jsx will automatically update the Global Context balance
    } catch (err) {
      toast.error(err.response?.data?.message || "Exchange failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
          <Repeat size={120} />
        </div>

        <h1 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3">
          Instant <span className="text-yellow-500">Liquidity</span>
        </h1>

        <div className="space-y-3">
          {/* BTC FROM */}
          <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
            <div className="flex justify-between mb-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sell (BTC)</span>
              <span className="text-[10px] font-black text-yellow-500">Available: {user?.balances?.BTC || 0}</span>
            </div>
            <input 
              type="number" 
              value={btcInput}
              onChange={(e) => setBtcInput(e.target.value)}
              className="bg-transparent text-3xl font-bold w-full outline-none placeholder:text-gray-800"
              placeholder="0.00000000"
            />
          </div>

          <div className="flex justify-center -my-6 relative z-10">
            <div className="bg-yellow-500 p-3 rounded-full text-black shadow-xl">
              <ArrowDown size={20} />
            </div>
          </div>

          {/* EUR TO */}
          <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
            <div className="flex justify-between mb-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Receive (EUR)</span>
            </div>
            <div className="text-3xl font-bold text-gray-400">
              €{eurPreview.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-yellow-500" />
            <span className="text-[10px] font-black text-gray-500 uppercase">Current Rate</span>
          </div>
          <span className="text-[10px] font-black text-white">1 BTC ≈ €{rate.toLocaleString()}</span>
        </div>

        <button 
          onClick={executeSwap}
          disabled={loading}
          className="w-full mt-8 py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Repeat size={20} />}
          Execute Exchange
        </button>
      </div>
    </div>
  );
}
