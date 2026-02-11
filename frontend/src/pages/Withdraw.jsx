import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Wallet,
  ChevronRight,
  TrendingUp,
  LogOut,
  ArrowDownCircle,
  ShieldCheck,
  Loader2,
  Info
} from 'lucide-react';
import api from '../api/apiService';
import toast from 'react-hot-toast';

export default function Withdraw() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Handled internally for stability
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (Number(amount) < 10) return toast.error("Minimum withdrawal is €10");

    try {
      setLoading(true);
      await api.post('/transactions/withdraw', {
        amount: Number(amount),
        walletAddress: address,
        currency: 'BTC'
      });
      toast.success("Withdrawal request submitted to Trustra Nodes");
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-white/5 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-500" />
          <span className="font-black text-xl tracking-tighter italic uppercase">Trustra</span>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 rounded-xl transition uppercase text-[10px] font-black tracking-widest">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <div className="pt-8 pb-2 text-[9px] uppercase tracking-[0.2em] text-gray-600 px-3 font-black">Finance</div>
          <Link to="/withdraw" className="flex items-center gap-3 bg-blue-600/10 text-blue-500 p-3 rounded-xl uppercase text-[10px] font-black tracking-widest">
            <ArrowDownCircle size={18} /> Withdraw
          </Link>
          <Link to="/deposit" className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 rounded-xl transition uppercase text-[10px] font-black tracking-widest">
            <PlusCircle size={18} /> Add Money
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-xl flex items-center justify-end px-8 sticky top-0 z-40">
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition">
            Logout <LogOut size={16} />
          </button>
        </header>

        <main className="p-6 md:p-12 max-w-5xl w-full mx-auto space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Withdraw Funds</h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Transfer earnings from your Trustra Wallet to personal storage.</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            {/* WITHDRAWAL FORM */}
            <form onSubmit={handleWithdraw} className="lg:col-span-3 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Wallet size={120} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Amount to Payout (€)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-blue-500 text-2xl">€</span>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-6 text-2xl font-mono font-black focus:border-blue-500 outline-none transition"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Destination Address (BTC/USDT)</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-blue-400 font-mono text-xs focus:border-blue-500 outline-none transition"
                  placeholder="Paste External Wallet Address"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all flex justify-center items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Request Payout <ChevronRight size={18} /></>}
              </button>
            </form>

            {/* SIDE INFO */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center gap-3 text-blue-500">
                    <ShieldCheck size={24} />
                    <h3 className="font-black uppercase italic text-sm">Security Verification</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Withdrawals are processed manually by Trustra Nodes to ensure capital security. 
                    Standard processing time: <span className="text-white font-bold">1–6 Hours</span>.
                  </p>
                  <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                    <Info size={18} className="text-blue-500 shrink-0" />
                    <p className="text-[10px] text-gray-400 leading-tight">
                      Ensure your wallet address supports the <span className="text-white font-bold">BTC/TRC20</span> network.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

