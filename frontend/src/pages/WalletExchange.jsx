// src/pages/WalletExchange.jsx - Production v8.4.1
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Zap, History, Repeat, PlusCircle, LogOut, 
  ArrowDown, RefreshCw, Info, ShieldCheck, Loader2, Wallet 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBtcPrice } from '../hooks/useBtcPrice';
import api from '../api/api';
import { API_ENDPOINTS } from '../constants/api';
import toast from 'react-hot-toast';

function SidebarLink({ to, icon, label, active = false }) {
  return (
    <Link to={to} className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
      {icon}
      <span className="text-[10px] font-black tracking-widest">{label}</span>
    </Link>
  );
}

export default function WalletExchange() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const btcPrice = useBtcPrice(15000); // High-frequency 15s sync

  const [fromAmount, setFromAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0);

  useEffect(() => {
    if (btcPrice) {
      // Trustra Audit Spread: 0.5% below market for sell orders
      setExchangeRate(btcPrice * 0.995);
    }
  }, [btcPrice]);

  const btcBalance = user?.balances?.BTC || 0;
  const estimatedEUR = fromAmount ? (parseFloat(fromAmount) * exchangeRate).toFixed(2) : '0.00';

  const handleExchange = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return toast.error("Enter a valid amount");
    if (parseFloat(fromAmount) > btcBalance) return toast.error("Insufficient BTC Balance");

    setIsSwapping(true);
    try {
      // Using centralized WALLET.EXCHANGE endpoint (must be defined in constants/api.js)
      await api.post('/wallet/exchange', {
        from: 'BTC',
        to: 'EUR',
        amount: parseFloat(fromAmount)
      });
      
      toast.success("Liquidity Successfully Converted");
      setFromAmount('');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Exchange Protocol Failed");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen p-8">
        <div className="flex items-center gap-3 mb-12 px-2 text-xl font-black italic tracking-tighter uppercase">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><Zap size={22} /></div>
          Trustra
        </div>
        <nav className="flex-1 space-y-2">
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18}/>} label="DASHBOARD" />
          <SidebarLink to="/plans" icon={<Zap size={18}/>} label="ALL PLANS" />
          <SidebarLink to="/investments" icon={<History size={18}/>} label="INVESTMENT LOGS" />
          <SidebarLink to="/deposit" icon={<PlusCircle size={18}/>} label="DEPOSIT" />
          <SidebarLink to="/exchange" icon={<Repeat size={18}/>} label="EXCHANGE" active={true} />
        </nav>
        <button onClick={logout} className="mt-auto flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest"><LogOut size={18} /> Sign Out</button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
             <RefreshCw size={14} className="animate-spin text-indigo-500" /> Live Liquidity Terminal
          </div>
          <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Protocol v8.4.1</div>
        </header>

        <main className="flex-1 p-8 lg:p-24 flex items-center justify-center">
          <div className="max-w-lg w-full space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">Swap Assets</h1>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Instant Portfolio Rebalancing</p>
            </div>

            <div className="bg-[#0a0c10] border border-white/10 rounded-[3rem] p-10 shadow-3xl space-y-6">
              {/* FROM BTC */}
              <div className="bg-black/40 border border-white/5 p-6 rounded-2xl group focus-within:border-indigo-500/50 transition-all">
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">
                  <span>Sell (BTC)</span>
                  <span>Balance: {btcBalance.toFixed(8)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <input 
                    type="number"
                    placeholder="0.00000000"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="bg-transparent border-none text-2xl font-black focus:ring-0 p-0 w-2/3"
                  />
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-black">₿</div>
                    <span className="text-xs font-black">BTC</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center -my-8 relative z-10">
                <div className="bg-indigo-600 p-3 rounded-full border-4 border-[#0a0c10] shadow-xl">
                  <ArrowDown size={20} className="text-white" />
                </div>
              </div>

              {/* TO EUR */}
              <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">
                  <span>Receive (EUR)</span>
                  <span className="text-indigo-400 font-black">Rate: €{exchangeRate.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white/50 italic">€{estimatedEUR}</span>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-black italic">€</div>
                    <span className="text-xs font-black">EUR</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleExchange}
                disabled={isSwapping || !fromAmount}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSwapping ? <Loader2 className="animate-spin" /> : <><Repeat size={18} /> Execute Swap</>}
              </button>
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-2xl flex gap-4">
              <ShieldCheck size={20} className="text-indigo-400 shrink-0" />
              <p className="text-[9px] text-indigo-200/60 uppercase font-black leading-relaxed tracking-wider">
                Audit Protocol: Swaps are executed within the Trustra internal ledger for zero slippage. Settlement is instantaneous.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

