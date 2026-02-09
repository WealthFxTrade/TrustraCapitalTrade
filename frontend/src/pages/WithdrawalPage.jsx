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

  // Derive EUR balance from the User's balance Map
  const availableBalance = user?.balances?.EUR || 0;

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    // Business Logic Validations
    if (!address || address.length < 10) return toast.error("Invalid destination address or IBAN");
    if (numAmount < 80) return toast.error("Minimum liquidation threshold is €80.00");
    if (numAmount > availableBalance) return toast.error("Insufficient EUR Node balance");

    setLoading(true);
    try {
      // Endpoint matches your router: /api/transactions/withdraw
      const res = await api.post('/transactions/withdraw', {
        amount: numAmount,
        walletAddress: address,
        currency: 'EUR'
      });

      if (res.data.success) {
        toast.success("Liquidation request submitted for security review");
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || "Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-6 md:p-12 selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition mb-10 group"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition" size={18} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Node</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* Main Liquidation Form */}
          <div className="lg:col-span-3 space-y-8">
            <header>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                Liquidate Assets
              </h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                Withdraw EUR to External Bank or BTC Node
              </p>
            </header>

            <form onSubmit={handleWithdrawal} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest ml-1">
                  Payout Amount (EUR)
                </label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-blue-500">€</div>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-6 pl-12 pr-6 text-2xl font-mono font-bold outline-none focus:border-blue-500 transition shadow-inner"
                  />
                </div>
                <div className="flex justify-between px-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Min: €80.00</span>
                  <button
                    type="button"
                    onClick={() => setAmount(availableBalance)}
                    className="text-[10px] text-blue-500 font-black hover:text-blue-400 transition uppercase tracking-tighter"
                  >
                    Max: €{availableBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest ml-1">
                  Destination Address (BTC / SEPA IBAN)
                </label>
                <div className="relative group">
                  <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition" size={18} />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter external wallet or IBAN"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 pl-14 text-xs font-mono outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/20 active:scale-[0.98]"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <><Send size={18} /> Initiate Payout</>}
              </button>
            </form>
          </div>

          {/* Sidebar: Security & Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-blue-600/5 border border-blue-500/10 p-8 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldAlert size={80} />
              </div>

              <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-6 flex items-center gap-2 font-mono">
                <ShieldAlert size={14} /> Security Protocol
              </h3>

              <ul className="space-y-6">
                <li className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Settlement Window</p>
                  <p className="text-[11px] font-bold text-slate-200">12 - 24 Node Working Hours</p>
                </li>
                <li className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Network Fee</p>
                  <p className="text-[11px] font-bold text-emerald-500">€0.00 (Zero Fee Entry)</p>
                </li>
              </ul>

              <div className="mt-10 p-4 bg-black/40 rounded-2xl border border-white/5 flex items-start gap-3">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[9px] text-slate-500 font-bold leading-relaxed italic">
                  Funds are extracted from your EUR Node. Ensure destination data is verified. Correcting unverified transactions is not supported.
                </p>
              </div>
            </div>

            {/* Node Status */}
            <div className="flex items-center justify-between px-6 py-5 bg-black/20 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <Banknote size={18} className="text-slate-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Liquidity Status</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-500">OPTIMAL</span>
            </div>
          </div>
        </div>

        {/* Footer Branding */}
        <p className="mt-20 text-center text-[9px] font-black text-slate-800 uppercase tracking-[0.5em]">
          Trustra Capital Trade • SSL AES-256 Extraction Protocol
        </p>
      </div>
    </div>
  );
}

