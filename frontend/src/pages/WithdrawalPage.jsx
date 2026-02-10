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
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/api';

const BTC_REGEX = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/;
const IBAN_REGEX = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;

export default function WithdrawalPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Advisory only — backend must recheck
  const availableBalance = Number(user?.balances?.EUR ?? 0);

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    if (loading) return;

    const numAmount = Number(amount);

    /* -------- Validation -------- */
    const isBTC = BTC_REGEX.test(address);
    const isIBAN = IBAN_REGEX.test(address.replace(/\s+/g, '').toUpperCase());

    if (!isBTC && !isIBAN) {
      return toast.error('Invalid BTC address or SEPA IBAN');
    }

    if (!Number.isFinite(numAmount) || numAmount < 80) {
      return toast.error('Minimum liquidation threshold is €80.00');
    }

    if (numAmount > availableBalance) {
      return toast.error('Insufficient EUR balance');
    }

    setLoading(true);

    try {
      const res = await api.post(
        '/transactions/withdraw',
        {
          amount: numAmount,
          walletAddress: address.trim(),
          currency: 'EUR',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        res?.data?.message ||
          'Liquidation request submitted for security review'
      );
      navigate('/dashboard');
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Withdrawal request failed. Please contact support.';
      toast.error(message);
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
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Return to Node
          </span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3 space-y-8">
            <header>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                Liquidate Assets
              </h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                Withdraw EUR to External Bank or BTC Node
              </p>
            </header>

            <form onSubmit={handleWithdrawal} className="space-y-8">
              {/* Amount */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest ml-1">
                  Payout Amount (EUR)
                </label>

                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-blue-500">
                    €
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                    placeholder="0.00"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-6 pl-12 pr-6 text-2xl font-mono font-bold outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="flex justify-between px-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase italic">
                    Threshold: €80.00
                  </span>
                  <button
                    type="button"
                    onClick={() => setAmount(availableBalance.toFixed(2))}
                    className="text-[10px] text-blue-500 font-black uppercase hover:text-blue-400"
                  >
                    Max: €
                    {availableBalance.toLocaleString('de-DE', {
                      minimumFractionDigits: 2,
                    })}
                  </button>
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest ml-1">
                  Destination (BTC / SEPA IBAN)
                </label>

                <div className="relative group">
                  <Wallet
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500"
                    size={18}
                  />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                    placeholder="Paste Wallet Address or IBAN"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-12 pr-6 text-xs font-mono outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
                  loading
                    ? 'bg-blue-600/50 cursor-not-allowed text-slate-400'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <>
                    <Send size={16} /> Request Extraction
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-blue-600/5 border border-blue-500/10 p-8 rounded-[2.5rem]">
              <header className="flex items-center gap-3 mb-6">
                <ShieldAlert className="text-blue-500" size={20} />
                <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-400 italic">
                  Security Protocol
                </h4>
              </header>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <Info size={14} className="text-slate-600 mt-0.5" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase">
                    Requests processed within{' '}
                    <span className="text-white">2–24 hours</span> after audit.
                  </p>
                </li>
                <li className="flex gap-3">
                  <Info size={14} className="text-slate-600 mt-0.5" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase">
                    Use <span className="text-white">SEPA</span> or{' '}
                    <span className="text-white">BTC SegWit</span> only.
                  </p>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-center">
              <ShieldCheck className="text-blue-600/50 mx-auto mb-4" size={48} />
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
                Vault Guard: Active
              </p>
              <p className="text-[8px] text-slate-700 mt-2 uppercase font-bold">
                Encrypted via AES-256
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
