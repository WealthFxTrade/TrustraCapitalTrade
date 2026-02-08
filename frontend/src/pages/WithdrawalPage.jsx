import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Wallet, 
  Send, 
  ShieldAlert, 
  Info, 
  RefreshCw,
  Banknote
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/apiService';

export default function WithdrawalPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const availableBalance = user?.balances?.EUR || 0;

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (numAmount < 80) return toast.error("Minimum withdrawal is €80.00");
    if (numAmount > availableBalance) return toast.error("Insufficient EUR balance");

    setLoading(true);
    try {
      const res = await api.post('/transactions/withdraw', {
        amount: numAmount,
        walletAddress: address,
        currency: 'EUR'
      });

      if (res.data.success) {
        toast.success("Withdrawal request submitted for review");
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition mb-10 group"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition" size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Return</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Main Form */}
          <div className="lg:col-span-3 space-y-8">
            <header>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">Liquidate Assets</h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Withdraw EUR to External Node</p>
            </header>

            <form onSubmit={handleWithdrawal} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest ml-1">Payout Amount (EUR)</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-blue-500">€</div>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-6 pl-12 pr-6 text-2xl font-mono font-bold outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div className="flex justify-between px-2">
                    <span className="text-[10px] text-slate-500 font-bold">MIN: €80.00</span>
                    <button 
                        type="button"
                        onClick={() => setAmount(availableBalance)}
                        className="text-[10px] text-blue-500 font-bold hover:underline"
                    >
                        MAX: €{availableBalance.toLocaleString('de-DE')}
                    </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest ml-1">Destination Address (BTC/SEPA)</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter external wallet or IBAN"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-mono outline-none focus:border-blue-500 transition"
                />
              </div>

              <button 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/20"
              >
                {loading ? <RefreshCw className="animate-spin" /> : <><Send size={18}/> Initiate Payout</>}
              </button>
            </form>
          </div>

          {/* Right Sidebar: Security Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
               <div className="flex items-center gap-3 mb-6">
                 <ShieldAlert className="text-amber-500" size={20} />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Protocol Notice</h4>
               </div>
               <ul className="space-y-4 text-[11px] text-slate-400 font-medium leading-relaxed">
                 <li className="flex gap-2">
                   <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                   Withdrawals are subject to 24-hour manual audit.
                 </li>
                 <li className="flex gap-2">
                   <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                   SEPA transfers (EUR) typically incur no platform fees.
                 </li>
                 <li className="flex gap-2">
                   <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                   Ensure destination address accuracy. Trustra cannot reverse blockchain settlements.
                 </li>
               </ul>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/20 p-8 rounded-[2.5rem] text-center">
              <Banknote className="mx-auto text-blue-500 mb-4" size={32} />
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Standard Processing</p>
              <p className="text-xs font-bold">1–2 Hours (2026 Avg.)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

