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
  Info,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../constants/api'; // ← centralized

function SidebarLink({ to, icon, label, active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-xl transition uppercase text-[10px] font-black tracking-widest ${
        active ? 'bg-blue-600/10 text-blue-500' : 'text-gray-400 hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export default function Withdraw() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const availableBalance = Number(user?.balances?.EUR || 0);
  const minWithdrawal = 10; // €10 minimum

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
    if (!confirm(`Confirm withdrawal of €\( {numAmount.toFixed(2)} to address:\n\n \){address}\n\nThis action cannot be reversed.`)) {
      return;
    }

    setLoading(true);

    try {
      // Use centralized endpoint if defined, fallback to original
      const endpoint = API_ENDPOINTS?.WITHDRAWAL || '/transactions/withdraw';
      await api.post(endpoint, {
        amount: numAmount,
        walletAddress: address.trim(),
        currency: 'BTC', // or let user select
      });

      toast.success('Withdrawal request submitted. Processing may take time.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Withdrawal failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
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
            <PlusCircle size={18} /> Deposit
          </Link>
        </nav>
        <button onClick={logout} className="mt-auto flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest">
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-xl flex items-center justify-end px-8 sticky top-0 z-40">
          <button onClick={logout} className="text-gray-400 hover:text-red-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition">
            Logout <LogOut size={16} />
          </button>
        </header>

        <main className="p-6 md:p-12 max-w-5xl w-full mx-auto space-y-10">
          {/* Warning Banner */}
          <div className="bg-red-900/30 border border-red-500/50 rounded-3xl p-6 flex items-start gap-4">
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={28} />
            <div>
              <h4 className="font-bold text-red-300 mb-2">Critical Warning</h4>
              <p className="text-red-200 text-sm leading-relaxed">
                Cryptocurrency withdrawals involve high risk of total loss. Only withdraw funds you can afford to lose. Verify the destination address carefully — incorrect addresses result in permanent loss. This platform is for informational/educational purposes only. No guarantees are made regarding returns or processing.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Withdraw Funds</h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider italic">
              Available Balance: €{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            {/* Withdrawal Form */}
            <form onSubmit={handleWithdraw} className="lg:col-span-3 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Wallet size={120} className="text-blue-900" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                  Amount to Withdraw (€)
                </label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-blue-500 text-2xl">€</span>
                  <input
                    type="number"
                    step="0.01"
                    min={minWithdrawal}
                    max={availableBalance}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-6 text-2xl font-mono font-black focus:border-blue-500 outline-none transition"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[9px] text-gray-500">
                  Min: €{minWithdrawal.toFixed(2)} • Max: €{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                  Destination Wallet Address (BTC/USDT)
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value.trim())}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-blue-400 font-mono text-xs focus:border-blue-500 outline-none transition"
                  placeholder="Paste your external wallet address (double-check!)"
                />
                <p className="text-[9px] text-gray-500">
                  Ensure the address is correct and supports {amount > 0 ? 'BTC/USDT' : 'your selected currency'}. Wrong address = permanent loss.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !amount || Number(amount) < minWithdrawal || Number(amount) > availableBalance || !address.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-900/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Processing...
                  </>
                ) : (
                  <>
                    Authorize Withdrawal <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Side Info / Warnings */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-8 bg-blue-900/10 border border-blue-500/20 rounded-3xl space-y-4">
                <ShieldAlert className="text-blue-400" size={28} />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Important Notes</h4>
                <ul className="text-xs text-gray-300 space-y-2 list-disc pl-4">
                  <li>Withdrawals are irreversible. Verify address twice.</li>
                  <li>Processing times vary by network congestion.</li>
                  <li>No fees are required to release funds — beware of anyone asking for extra payments.</li>
                  <li>Contact support only through official channels.</li>
                </ul>
              </div>

              <div className="p-8 bg-white/5 border border-white/5 rounded-3xl flex items-start gap-4">
                <Info size={20} className="text-gray-400 shrink-0 mt-1" />
                <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed">
                  Cryptocurrency transactions are final. Trustra Capital is not responsible for losses due to incorrect addresses or unauthorized requests.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
