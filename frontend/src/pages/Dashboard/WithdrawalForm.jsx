/**
 * Trustra Capital Trade - Withdrawal Form Component
 * Fully unshortened, production-ready version with professional UI
 */

import React, { useState, useEffect } from 'react';
import api from '../../constants/api';
import toast from 'react-hot-toast';
import { 
  ArrowUpRight, ShieldCheck, Wallet, Zap, Info, 
  Loader2, Lock, AlertTriangle, Fingerprint 
} from 'lucide-react';

export default function WithdrawalForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    amount: '',
    asset: 'USDT',
    address: '',
    walletType: 'ROI' // ROI (Yield) or Principal (Main)
  });

  const [loading, setLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);

  // Fetch available balance when walletType changes
  useEffect(() => {
    const fetchLiquidity = async () => {
      try {
        const res = await api.get('/user/balances');
        if (res.data?.success) {
          const bals = res.data.balances || {};
          const balance = formData.walletType === 'ROI' 
            ? (bals.ROI || 0) 
            : (bals.INVESTED || 0);
          setAvailableBalance(Number(balance));
        }
      } catch (err) {
        console.error("Balance Sync Interrupted");
        toast.error("Unable to fetch current balance");
      }
    };

    fetchLiquidity();
  }, [formData.walletType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numAmount = parseFloat(formData.amount);

    // ── PROTOCOL VALIDATION ──
    if (!formData.amount || numAmount <= 0) {
      return toast.error("PROTOCOL REJECTION: Please enter a valid amount");
    }

    if (numAmount > availableBalance) {
      return toast.error("LIQUIDITY ERROR: Amount exceeds available balance");
    }

    if (numAmount < 50) {
      return toast.error("PROTOCOL REJECTION: Minimum extraction is €50");
    }

    if (formData.asset !== 'EUR' && !formData.address) {
      return toast.error("Please provide a valid destination wallet address");
    }

    setLoading(true);
    const toastId = toast.loading("Encrypting Withdrawal Signal...");

    try {
      const payload = {
        amount: numAmount,
        asset: formData.asset,
        walletType: formData.walletType,
        address: formData.address || null,
      };

      const res = await api.post('/user/withdrawal', payload);

      toast.success(
        res.data.message || "Extraction Signal Queued Successfully", 
        { 
          id: toastId,
          style: { background: '#065f46', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
        }
      );

      // Reset form after success
      setFormData({ ...formData, amount: '', address: '' });

      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Protocol Rejection: Gateway Timeout",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-[#0a0c10] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden relative group">
      {/* Security Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-emerald-500/20 blur-xl group-hover:bg-emerald-500/40 transition-all" />

      <div className="p-10 lg:p-12">
        <header className="mb-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 text-emerald-500 mb-2">
              <Fingerprint size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Auth Level 3</span>
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              Secure <span className="text-emerald-500">Extraction</span>
            </h2>
          </div>

          <div className="text-right">
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Node Liquidity</p>
            <p className="text-xl font-mono font-black text-white italic">
              €{availableBalance.toLocaleString('de-DE')}
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Source Selector */}
          <div className="space-y-3">
            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2 flex items-center gap-2">
              <Wallet size={12} /> Origin Protocol
            </label>
            <div className="grid grid-cols-2 gap-4">
              {['ROI', 'Main'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, walletType: type })}
                  className={`py-5 rounded-2xl border transition-all uppercase text-[10px] font-black tracking-[0.2em] flex flex-col items-center gap-1 ${
                    formData.walletType === type
                      ? 'bg-emerald-600 border-emerald-500 text-black shadow-lg shadow-emerald-600/10'
                      : 'bg-black/40 border-white/5 text-gray-500 hover:border-emerald-500/30 hover:bg-white/5'
                  }`}
                >
                  {type} Vault
                  <span className="text-[8px] opacity-60 font-bold italic lowercase">
                    {type === 'ROI' ? 'yield accruals' : 'principal base'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 focus-within:border-emerald-500/30 transition-all group/input">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">
                Extraction Magnitude (EUR)
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: availableBalance.toString() })}
                className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full hover:bg-emerald-500 hover:text-black transition-all"
              >
                MAX SIGNAL
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-black text-emerald-500 italic">€</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-transparent text-4xl font-black focus:outline-none text-white placeholder-white/5 tracking-tighter"
              />
            </div>
          </div>

          {/* Destination Address */}
          <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 focus-within:border-emerald-500/30 transition-all">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">
                Destination {formData.asset} Wallet
              </label>
              <Zap size={14} className="text-emerald-500 opacity-40 animate-pulse" />
            </div>
            <input
              type="text"
              placeholder={`Enter high-integrity destination hash`}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-transparent text-sm font-mono focus:outline-none text-emerald-400 placeholder-white/5 tracking-tighter"
            />
          </div>

          {/* Security Protocol Note */}
          <div className="flex items-start gap-5 p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <ShieldCheck size={40} className="text-emerald-500" />
            </div>
            <AlertTriangle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Compliance Node Active</p>
              <p className="text-[9px] font-bold text-gray-500 uppercase leading-relaxed tracking-wider">
                Extracts are processed within <span className="text-white">12 - 24 Hours</span> following dual-consensus audit. Standard network fees apply.
              </p>
            </div>
          </div>

          {/* Authorization Button */}
          <button
            type="submit"
            disabled={loading}
            className={`group w-full p-8 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-4 ${
              loading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed italic'
                : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-emerald-500/20 active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <ShieldCheck className="group-hover:rotate-12 transition-transform" size={18} />
            )}
            {loading ? 'Transmitting Signal...' : 'Authorize Extraction'}
          </button>
        </form>
      </div>

      {/* Security Footer */}
      <div className="bg-white/5 p-5 flex justify-center gap-8 border-t border-white/5">
        <SecurityTag icon={<Lock size={12} />} label="SSL SECURED" />
        <SecurityTag icon={<ShieldCheck size={12} />} label="AES-256 BIT" />
        <SecurityTag icon={<Zap size={12} />} label="INSTANT SYNC" />
      </div>
    </div>
  );
}

function SecurityTag({ icon, label }) {
  return (
    <div className="flex items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}
