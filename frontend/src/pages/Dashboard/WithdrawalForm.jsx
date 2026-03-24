// src/pages/Dashboard/WithdrawalForm.jsx
import React, { useState } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import {
  ArrowUpRight,
  ShieldCheck,
  Wallet,
  Loader2,
  Lock,
  ChevronRight,
  Info,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function WithdrawalForm({ onSuccess, maxWithdrawable = Infinity }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    asset: 'BTC',
    address: '',
    walletType: 'main',
  });

  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);

  // Asset-specific address validation regex
  const addressPatterns = {
    BTC: /^(bc1|[13])[a-zA-Z0-9]{25,39}$/,
    ETH: /^0x[a-fA-F0-9]{40}$/,
    USDT: /^0x[a-fA-F0-9]{40}$/, // ERC-20 same as ETH
  };

  const validateForm = () => {
    const newErrors = {};
    const amountNum = Number(formData.amount);

    // Amount validation
    if (!formData.amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Enter a valid amount';
    } else if (amountNum < 50) {
      newErrors.amount = 'Minimum withdrawal is €50.00';
    } else if (amountNum > maxWithdrawable) {
      newErrors.amount = `Insufficient balance (max: €${maxWithdrawable.toFixed(2)})`;
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Destination address is required';
    } else if (formData.address.length < 25) {
      newErrors.address = `Address too short for ${formData.asset}`;
    } else if (!addressPatterns[formData.asset]?.test(formData.address.trim())) {
      newErrors.address = `Invalid ${formData.asset} address format`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        amount: Number(formData.amount),
        asset: formData.asset,
        address: formData.address.trim(),
        walletType: formData.walletType,
      };

      const res = await api.post('/user/withdraw', payload);

      toast.success(res.data.message || 'Withdrawal request submitted successfully');
      
      // Reset form on success
      setFormData({
        amount: '',
        asset: 'BTC',
        address: '',
        walletType: 'main',
      });
      setErrors({});

      if (onSuccess) onSuccess(); // refresh balances/ledger in parent
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 400 ? 'Invalid withdrawal request' :
         err.response?.status === 401 ? 'Session expired – please log in again' :
         'Withdrawal failed. Please try again later.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyAddressExample = () => {
    const examples = {
      BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      ETH: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      USDT: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    };
    const example = examples[formData.asset] || examples.BTC;
    
    navigator.clipboard.writeText(example);
    setCopied(true);
    toast.success(`Example ${formData.asset} address copied`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto p-8 lg:p-10 bg-[#0f121d] rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-15 transition-opacity duration-700">
        <Lock size={140} className="text-rose-500" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3">
              <ArrowUpRight className="text-rose-500" strokeWidth={3} size={28} />
              Capital <span className="text-rose-500">Release</span>
            </h2>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">
              Outbound Gateway v2.5.3 • Secure Node
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-900/20 border border-rose-700/30 text-[9px] font-black text-rose-300 uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" /> AES-256 Encrypted
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Wallet Type Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2 block">
              Source Liquidity Pool
            </label>
            <div className="grid grid-cols-2 gap-4">
              {['main', 'profit'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'walletType', value: type } })}
                  className={`p-6 rounded-2xl border transition-all uppercase text-[10px] font-black tracking-widest flex flex-col items-center gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    formData.walletType === type
                      ? 'bg-indigo-600/80 border-indigo-500 text-white shadow-xl shadow-indigo-600/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <Wallet size={20} />
                  {type.charAt(0).toUpperCase() + type.slice(1)} Wallet
                </button>
              ))}
            </div>
          </div>

          {/* Asset Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2 block">
              Asset to Withdraw
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['BTC', 'ETH', 'USDT'].map((crypto) => (
                <button
                  key={crypto}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'asset', value: crypto } })}
                  className={`py-4 rounded-xl border font-black text-[11px] tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${
                    formData.asset === crypto
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/20'
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  {crypto}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-4">
            <label htmlFor="amount" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2 block">
              Withdrawal Amount (EUR) *
            </label>
            <div className="relative">
              <input
                id="amount"
                type="number"
                name="amount"
                step="0.01"
                min="50"
                placeholder="50.00 minimum"
                value={formData.amount}
                onChange={handleChange}
                required
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                className={`w-full bg-[#0a0d14] border ${errors.amount ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-indigo-500/50'} p-5 rounded-2xl font-mono text-xl text-indigo-300 outline-none transition-all placeholder:text-gray-700`}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-600 uppercase pointer-events-none">
                EUR
              </span>
            </div>
            {errors.amount && (
              <p id="amount-error" className="text-rose-400 text-xs mt-1 ml-2 flex items-center gap-1">
                <AlertTriangle size={14} /> {errors.amount}
              </p>
            )}
            {maxWithdrawable < Infinity && formData.amount && Number(formData.amount) > maxWithdrawable && (
              <p className="text-rose-400 text-xs mt-1 ml-2 flex items-center gap-1">
                <AlertTriangle size={14} /> Available balance: €{maxWithdrawable.toFixed(2)}
              </p>
            )}
          </div>

          {/* Address Input */}
          <div className="space-y-4">
            <label htmlFor="address" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2 block">
              Destination {formData.asset} Address *
            </label>
            <div className="relative">
              <input
                id="address"
                type="text"
                name="address"
                placeholder={`Paste your ${formData.asset} wallet address...`}
                value={formData.address}
                onChange={handleChange}
                required
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? 'address-error' : undefined}
                className={`w-full bg-[#0a0d14] border ${errors.address ? 'border-rose-500 focus:border-rose-600' : 'border-white/10 focus:border-indigo-500/50'} p-5 rounded-2xl font-mono text-[13px] text-white outline-none transition-all placeholder:text-gray-700`}
              />
              <button
                type="button"
                onClick={copyAddressExample}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white focus:outline-none transition-colors"
                aria-label="Copy example address for current asset"
              >
                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
            </div>
            {errors.address && (
              <p id="address-error" className="text-rose-400 text-xs mt-1 ml-2 flex items-center gap-1">
                <AlertTriangle size={14} /> {errors.address}
              </p>
            )}
          </div>

          {/* Security Warning */}
          <div className="bg-rose-900/20 border border-rose-700/40 p-6 rounded-2xl flex items-start gap-4">
            <AlertTriangle size={22} className="text-rose-500 shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-black uppercase text-rose-400 mb-2">
                Irreversible Transaction Warning
              </h4>
              <p className="text-[10px] leading-relaxed text-rose-300/90">
                Withdrawals are final and cannot be reversed. Double-check the address carefully. Funds sent to incorrect or unsupported addresses will be permanently lost. Processing time: 10–60 minutes. 2FA verification may be required for large amounts.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-6 rounded-2xl font-black text-sm tracking-[0.3em] uppercase flex items-center justify-center gap-4 transition-all shadow-2xl ${
              loading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing Withdrawal...
              </>
            ) : (
              <>
                Initialize Secure Release
                <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </form>

        <footer className="mt-10 text-center">
          <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">
            End-to-End Encryption • AES-256 • Zurich Vault Node
          </p>
        </footer>
      </div>
    </div>
  );
}
