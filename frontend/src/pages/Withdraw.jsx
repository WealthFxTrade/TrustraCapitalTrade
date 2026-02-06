import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, History, PlusCircle, Wallet, 
  ChevronRight, TrendingUp, LogOut, ArrowDownCircle, 
  AlertCircle, Loader2, ShieldCheck 
} from 'lucide-react';
import api from '../api/apiService';
import toast from 'react-hot-toast';

export default function Withdraw({ logout }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="flex min-h-screen bg-[#0a0d14] text-white font-sans">
      
      {/* SIDEBAR (Matches Trustra Dashboard) */}
      <aside className="w-64 bg-[#0f121d] border-r border-gray-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-800 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-lg tracking-tight text-white">TrustraCapital</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm text-gray-400">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] font-bold tracking-widest">
            <LayoutDashboard size={18} /> DASHBOARD
          </Link>
          <div className="pt-6 pb-2 text-[10px] uppercase tracking-widest text-gray-600 px-3 font-bold">Payments</div>
          <Link to="/withdraw" className="flex items-center gap-3 bg-indigo-600/10 text-indigo-400 p-3 rounded-lg uppercase text-[11px] font-bold tracking-widest">
            <ArrowDownCircle size={18} /> WITHDRAW
          </Link>
          <Link to="/deposit" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] font-bold tracking-widest">
            <PlusCircle size={18} /> ADD MONEY
          </Link>
          <div className="pt-6 pb-2 text-[10px] uppercase tracking-widest text-gray-600 px-3 font-bold">Investments</div>
          <Link to="/plans" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] font-bold tracking-widest">
            <ShieldCheck size={18} /> ALL SCHEMA
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-800 bg-[#0f121d]/80 flex items-center justify-end px-8">
          <button onClick={logout} className="text-gray-400 hover:text-red-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            Logout <LogOut size={16} />
          </button>
        </header>

        <main className="p-8 max-w-4xl w-full mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold italic">Withdraw Funds</h1>
              <p className="text-gray-500 text-sm">Transfer earnings from your Trustra Wallet to your personal storage.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* WITHDRAWAL FORM */}
            <form onSubmit={handleWithdraw} className="md:col-span-3 bg-[#161b29] border border-gray-800 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Wallet size={80} />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 px-1">Amount to Payout (€)</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-indigo-400 text-sm">€</span>
                   <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0f121d] border border-gray-800 rounded-xl py-4 pl-10 pr-5 text-white font-bold focus:border-indigo-500 outline-none transition"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 px-1">Destination Address (BTC/USDT)</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#0f121d] border border-gray-800 rounded-xl py-4 px-5 text-indigo-400 font-mono text-xs focus:border-indigo-500 outline-none transition"
                  placeholder="Paste External Wallet Address"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-black text-xs tracking-widest uppercase transition flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Request Payout <ChevronRight size={18} /></>}
              </button>
            </form>

            {/* SIDE INFO */}
            <div className="md:col-span-2 space-y-6">
               <div className="bg-[#161b29] border border-gray-800 rounded-2xl p-6">
                 <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Payout Policy</h4>
                 <div className="flex gap-3">
                   <AlertCircle className="text-indigo-500 shrink-0" size={20} />
                   <p className="text-[11px] text-gray-400 leading-relaxed italic">
                     Funds are deducted instantly from your balance. Requests are vetted by Trustra Compliance within 1-24 hours for security.
                   </p>
                 </div>
               </div>

               <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6">
                  <div className="flex justify-between items-center text-[11px] mb-2">
                    <span className="text-gray-500 font-bold uppercase">Processing Fee</span>
                    <span className="text-green-500 font-black">0.00%</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-500 font-bold uppercase">Min Limit</span>
                    <span className="text-white font-black">€10.00</span>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

