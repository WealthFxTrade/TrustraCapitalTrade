// src/pages/Withdraw.jsx - Production v8.4.1
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, Wallet, ChevronRight,
  TrendingUp, LogOut, ArrowDownCircle, ShieldCheck,
  Loader2, Info, ShieldAlert, AlertTriangle,
} from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../constants/api';

export default function Withdraw() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Syncing with your existing AuthContext structure
  const availableBalance = Number(user?.balances?.EUR || user?.balance || 0);
  const minWithdrawal = 10; 

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (numAmount < minWithdrawal) {
      return toast.error(`Minimum withdrawal is €${minWithdrawal.toFixed(2)}`);
    }
    if (numAmount > availableBalance) {
      return toast.error('Insufficient balance');
    }
    if (!address.trim()) {
      return toast.error('Please enter a valid wallet address');
    }

    // Fixed the template literal syntax error from the snippet
    const confirmed = window.confirm(
      `Confirm withdrawal of €${numAmount.toFixed(2)} to address:\n\n${address}\n\nThis action cannot be reversed.`
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const endpoint = API_ENDPOINTS?.WITHDRAWAL?.CREATE || API_ENDPOINTS?.WITHDRAWAL || '/transactions/withdraw';
      
      await api.post(endpoint, {
        amount: numAmount,
        walletAddress: address.trim(),
        currency: 'BTC', 
      });

      toast.success('Withdrawal request submitted for audit.', {
        icon: '🛡️',
        style: { background: '#0a0c10', color: '#fff', border: '1px solid #eab308' }
      });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Withdrawal failed. Please contact node admin.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white font-sans selection:bg-yellow-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-white/5 flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <TrendingUp className="h-5 w-5 text-black" />
          </div>
          <span className="font-black text-xl tracking-tighter italic uppercase text-white">Trustra</span>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 rounded-xl transition uppercase text-[10px] font-black tracking-widest">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <div className="pt-8 pb-2 text-[9px] uppercase tracking-[0.2em] text-gray-600 px-3 font-black">Finance</div>
          <Link to="/withdraw" className="flex items-center gap-3 bg-yellow-500/10 text-yellow-500 p-3 rounded-xl uppercase text-[10px] font-black tracking-widest">
            <ArrowDownCircle size={18} /> Withdraw
          </Link>
          <Link to="/deposit" className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 rounded-xl transition uppercase text-[10px] font-black tracking-widest">
            <PlusCircle size={18} /> Deposit
          </Link>
        </nav>

        <button onClick={logout} className="mt-auto flex items-center gap-4 px-8 py-6 text-gray-500 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest border-t border-white/5">
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Liquidity Extraction Terminal</div>
          <button onClick={logout} className="text-gray-400 hover:text-red-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition">
            Logout <LogOut size={16} />
          </button>
        </header>

        <main className="p-6 md:p-12 max-w-5xl w-full mx-auto space-y-10">
          {/* Warning Banner */}
          <div className="bg-red-900/10 border border-red-500/30 rounded-3xl p-6 flex items-start gap-4">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-black text-red-500 uppercase text-xs tracking-widest mb-1">Security Protocol Warning</h4>
              <p className="text-red-200/60 text-[10px] leading-relaxed uppercase font-bold">
                Cryptocurrency withdrawals are irreversible. Only withdraw to a wallet you own. 
                Incorrect addresses result in permanent capital loss. Trustra Capital never asks for fees to release funds.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Withdraw Funds</h1>
            <p className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em] italic">
              Available Liquidity: €{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            {/* Withdrawal Form */}
            <form onSubmit={handleWithdraw} className="lg:col-span-3 bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-10 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Wallet size={120} className="text-yellow-900" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Amount to Withdraw (EUR)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-yellow-500 text-2xl">€</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-6 text-2xl font-black focus:border-yellow-500 outline-none transition"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex justify-between px-1">
                   <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Min: €{minWithdrawal.toFixed(2)}</p>
                   <button type="button" onClick={() => setAmount(availableBalance)} className="text-[9px] text-yellow-500 font-black uppercase hover:underline">Withdraw Max</button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Destination BTC Wallet Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-yellow-400 font-mono text-xs focus:border-yellow-500 outline-none transition"
                  placeholder="Paste external bc1q... address"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !amount || Number(amount) < minWithdrawal || Number(amount) > availableBalance || !address.trim()}
                className="w-full bg-yellow-500 hover:bg-white disabled:bg-gray-800 text-black font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-yellow-500/10"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Authorize Withdrawal <ChevronRight size={18} /></>}
              </button>
            </form>

            {/* Sidebar Security Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-8 bg-yellow-500/5 border border-yellow-500/10 rounded-[2.5rem] space-y-6">
                <ShieldAlert className="text-yellow-500" size={28} />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">Protocol Audit Guidelines</h4>
                <ul className="text-[10px] text-gray-400 space-y-4 font-bold uppercase tracking-tighter">
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1 shrink-0" /> Processing: 1–24 Hours</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1 shrink-0" /> Minimum Settlement: €10.00</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1 shrink-0" /> Verification: Protocol v8.4.1 Active</li>
                </ul>
              </div>

              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl flex items-start gap-4">
                <Info size={20} className="text-gray-600 shrink-0 mt-1" />
                <p className="text-[9px] text-gray-600 font-black uppercase leading-relaxed tracking-widest">
                  Assets are secured via multi-signature vaults. Ensure your destination wallet is compatible with BTC/SegWit.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
