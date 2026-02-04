import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getUserBalance, requestWithdrawal } from '../api';
import toast from 'react-hot-toast';

export default function WithdrawalPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState({ BTC: 0, USDT: 0, ETH: 0 });
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'BTC',
    address: '',
    referenceId: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  });

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      const res = await getUserBalance();
      // Ensure this matches your backend User.balances structure
      setBalances(res.data.user.balances || { BTC: 0, USDT: 0, ETH: 0 });
    } catch (err) {
      toast.error("Failed to load account balances");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (Number(formData.amount) > (balances[formData.currency] || 0)) {
      return toast.error(`Insufficient ${formData.currency} balance`);
    }

    setLoading(true);
    try {
      const res = await requestWithdrawal(formData);
      if (res.data.success) {
        toast.success("Withdrawal request submitted successfully!");
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-red-500/10 rounded-2xl">
              <Wallet className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Withdraw Funds</h1>
              <p className="text-slate-500 text-xs uppercase tracking-widest">Secure Asset Outflow</p>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {Object.entries(balances).map(([symbol, val]) => (
              <div key={symbol} className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-slate-500 text-[10px] font-bold uppercase">{symbol}</p>
                <p className="text-lg font-mono font-bold">{val.toFixed(4)}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleWithdraw} className="space-y-6">
            {/* Currency Select */}
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Select Asset</label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all"
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="ETH">Ethereum (ETH)</option>
              </select>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Withdrawal Amount</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="any"
                  required
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all font-mono"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, amount: balances[formData.currency]})}
                  className="absolute right-3 top-3 text-xs text-indigo-500 font-bold hover:text-indigo-400"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Destination Address */}
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Destination Wallet Address</label>
              <input 
                type="text" 
                required
                placeholder={`Enter your ${formData.currency} address`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            {/* Security Warning */}
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-200/70 leading-relaxed">
                Ensure the destination address is correct. Crypto transfers are irreversible. 
                Withdrawals are usually processed within 1-2 hours.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Confirm Withdrawal
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

