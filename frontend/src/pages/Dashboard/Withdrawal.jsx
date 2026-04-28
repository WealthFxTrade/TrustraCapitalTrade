import React, { useState } from 'react';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';
import { ArrowRight, CheckCircle2, Wallet, AlertCircle, Loader2 } from 'lucide-react';

export default function Withdrawal({ balances, refreshBalances }) {
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

    if (numAmount < 50) return toast.error('Minimum withdrawal is €50');
    if (numAmount > availableEUR) return toast.error('Insufficient funds');
    if (!cleanAddress) return toast.error('Address is required');

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
        toast.success('Withdrawal requested successfully!');
        if (refreshBalances) await refreshBalances();
        setAmount('');
        setAddress('');
        setShowConfirm(false);
      } else {
        throw new Error(res.data?.message || 'Withdrawal failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden relative">
        {!showConfirm ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold mb-1">Request Payout</h2>
                <p className="text-gray-400 text-sm">Transfer funds to your external wallet</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Available</p>
                <p className="text-xl font-black text-emerald-400">€{availableEUR.toLocaleString('de-DE')}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-4 mb-2 block">Amount (EUR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-bold focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>

              <div className="relative group">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-4 mb-2 block">Destination Address / IBAN</label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter wallet or bank details"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-12 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                  <Wallet className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!amount || Number(amount) < 50 || !address.trim()}
              className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:hover:bg-white"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in duration-300 text-center py-4">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-emerald-500" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-2">Confirm Withdrawal</h3>
              <p className="text-gray-400">Please verify the details before processing.</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 text-left space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-gray-500 text-sm">Amount</span>
                <span className="font-bold">€{parseAmount().toLocaleString('de-DE')}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-gray-500 text-sm">Destination</span>
                <span className="font-mono text-xs break-all bg-black/30 p-3 rounded-lg border border-white/5">{address}</span>
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
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

