import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, Wallet, TrendingUp, AlertCircle, 
  RefreshCw, ShieldCheck, ArrowDown, CheckCircle 
} from 'lucide-react';
import api from '../api/apiService';

export default function WalletExchange() {
  const [balances, setBalances] = useState({ EUR: 0, totalProfit: 0 });
  const [fromWallet, setFromWallet] = useState('profit'); // Default: Profit to Main
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Sync balances on mount
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const { data } = await api.get('/user/dashboard');
        if (data.success) {
          setBalances({
            EUR: data.stats.mainBalance || 0,
            totalProfit: data.stats.totalProfit || 0
          });
        }
      } catch (err) {
        console.error("Balance sync failed");
      }
    };
    fetchBalances();
  }, []);

  const handleSwapDirection = () => {
    setFromWallet(prev => prev === 'profit' ? 'main' : 'profit');
    setAmount('');
    setStatus({ type: '', message: '' });
  };

  const handleExchange = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    
    const val = Number(amount);
    const sourceBalance = fromWallet === 'profit' ? balances.totalProfit : balances.EUR;

    if (val <= 0) return setStatus({ type: 'error', message: 'Enter a valid amount' });
    if (val > sourceBalance) return setStatus({ type: 'error', message: 'Insufficient funds in source wallet' });

    setLoading(true);
    try {
      // Endpoint logic: /api/transactions/reinvest (Profit -> Main) 
      // or a general /api/transactions/exchange endpoint
      const endpoint = fromWallet === 'profit' ? '/transactions/reinvest' : '/transactions/exchange';
      const res = await api.post(endpoint, { amount: val });
      
      if (res.data.success) {
        setStatus({ type: 'success', message: 'Exchange completed successfully' });
        setAmount('');
        // Refresh local balances
        const refresh = await api.get('/user/dashboard');
        setBalances({ EUR: refresh.data.stats.mainBalance, totalProfit: refresh.data.stats.totalProfit });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Exchange failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#05070a] min-h-screen text-white pt-32 pb-20 px-6">
      <div className="max-w-xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Wallet Exchange</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Internal Asset Reallocation • 2026 Audit Standard</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
          
          <form onSubmit={handleExchange} className="space-y-4 relative z-10">
            
            {/* FROM WALLET */}
            <div className="bg-black/40 border border-white/5 p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">From</span>
                <span className="text-[10px] font-bold text-slate-400">
                  Balance: €{(fromWallet === 'profit' ? balances.totalProfit : balances.EUR).toLocaleString('de-DE')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${fromWallet === 'profit' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {fromWallet === 'profit' ? <TrendingUp size={24}/> : <Wallet size={24}/>}
                </div>
                <div className="flex-1">
                  <h4 className="font-black uppercase italic text-sm">{fromWallet === 'profit' ? 'Profit Wallet' : 'Main Wallet'}</h4>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Source Account</p>
                </div>
              </div>
            </div>

            {/* SWAP ICON */}
            <div className="flex justify-center -my-6 relative z-20">
              <button 
                type="button"
                onClick={handleSwapDirection}
                className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/40 hover:scale-110 active:rotate-180 transition-all duration-500 border-4 border-[#05070a]"
              >
                <ArrowDown size={20} />
              </button>
            </div>

            {/* TO WALLET */}
            <div className="bg-black/40 border border-white/5 p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">To</span>
                <span className="text-[10px] font-bold text-slate-400">
                  Balance: €{(fromWallet === 'profit' ? balances.EUR : balances.totalProfit).toLocaleString('de-DE')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${fromWallet === 'profit' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                  {fromWallet === 'profit' ? <Wallet size={24}/> : <TrendingUp size={24}/>}
                </div>
                <div className="flex-1">
                  <h4 className="font-black uppercase italic text-sm">{fromWallet === 'profit' ? 'Main Wallet' : 'Profit Wallet'}</h4>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Destination Account</p>
                </div>
              </div>
            </div>

            {/* AMOUNT INPUT */}
            <div className="pt-4">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Amount to Exchange (EUR)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-blue-500 text-xl">€</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#05070a] border border-white/10 rounded-2xl py-5 px-12 text-2xl font-mono font-black focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            {status.message && (
              <div className={`flex items-center gap-3 p-4 rounded-2xl text-[11px] font-bold uppercase tracking-tight border ${
                status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}>
                {status.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                {status.message}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <>Confirm Exchange <ArrowRightLeft size={18} /></>}
            </button>

          </form>
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 text-slate-600">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-black">Secure Internal Ledger Protocol</span>
        </div>
      </div>
    </div>
  );
}

