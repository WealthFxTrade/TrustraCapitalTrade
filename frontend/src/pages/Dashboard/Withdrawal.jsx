// src/pages/Dashboard/Withdrawal.jsx
import React, { useState } from 'react';
import api, { API_ENDPOINTS } from '@/api/api';
import toast from 'react-hot-toast';
import { ArrowRight, CheckCircle2, Wallet, AlertCircle, Loader2 } from 'lucide-react';

export default function Withdrawal({ balances = {}, refreshBalances }) {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const availableEUR = Number(balances?.EUR || 0);

  const parseAmount = () => {
    const num = Number(amount);
    return isNaN(num) ? 0 : num;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseAmount();
    const cleanAddress = address.trim();

    if (numAmount < 50) return toast.error('Minimum withdrawal amount is €50');
    if (numAmount > availableEUR) return toast.error('Insufficient available balance');
    if (!cleanAddress) return toast.error('Destination address/IBAN is required');

    setShowConfirm(true);
  };

  const confirmWithdrawal = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await api.post(API_ENDPOINTS.USER.WITHDRAW, {
        amount: parseAmount(),
        address: address.trim(),
      });

      if (res.data?.success) {
        toast.success('Withdrawal request submitted successfully!', { icon: '✅' });
        setAmount('');
        setAddress('');
        setShowConfirm(false);
        refreshBalances?.();
      } else {
        throw new Error(res.data?.message || 'Withdrawal failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl">
        {!showConfirm ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold mb-1">Request Payout</h2>
                <p className="text-gray-400 text-sm">Transfer funds to your external wallet or bank</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Available Balance</p>
                <p className="text-xl font-black text-emerald-400">€{availableEUR.toLocaleString('de-DE')}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-4 mb-2 block">Amount (EUR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50.00"
                  min="50"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xl font-bold focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-4 mb-2 block">Destination Address / IBAN</label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter wallet address or bank IBAN"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pr-12 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                  <Wallet className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!amount || parseAmount() < 50 || !address.trim()}
              className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <div className="space-y-8 text-center py-6">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-emerald-500" />
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Confirm Withdrawal</h3>
              <p className="text-gray-400">Please review the details before confirming</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 text-left space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold">€{parseAmount().toLocaleString('de-DE')}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Destination</span>
                <span className="font-mono text-xs break-all bg-black/50 p-3 rounded-lg border border-white/5">
                  {address}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => !loading && setShowConfirm(false)}
                className="py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all"
              >
                Back
              </button>
              <button
                onClick={confirmWithdrawal}
                disabled={loading}
                className="py-4 bg-emerald-500 text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {loading ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
