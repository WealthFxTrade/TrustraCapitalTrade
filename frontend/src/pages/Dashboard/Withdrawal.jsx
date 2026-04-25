// src/pages/Dashboard/Withdrawal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpCircle, 
  ShieldCheck, 
  Loader2, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-react';
import api from '../../constants/api';
import toast from 'react-hot-toast';

export default function Withdrawal({ balances, refreshBalances }) {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const availableEUR = Number(balances?.EUR || 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount < 50) {
      return toast.error('Minimum withdrawal amount is €50');
    }

    if (numAmount > availableEUR) {
      return toast.error('Amount exceeds available balance');
    }

    if (!address.trim()) {
      return toast.error('Please enter a valid destination address');
    }

    setShowConfirm(true);
  };

  const confirmWithdrawal = async () => {
    const numAmount = parseFloat(amount);
    setLoading(true);

    try {
      const res = await api.post('/api/users/withdraw', {
        amount: numAmount,
        address: address.trim(),
      });

      if (res.data?.success) {
        toast.success(`Withdrawal of €${numAmount.toLocaleString('de-DE')} requested successfully!`, {
          icon: '✅',
          duration: 6000,
        });

        // Refresh balances in parent
        if (refreshBalances) refreshBalances();

        // Reset form
        setAmount('');
        setAddress('');
        setShowConfirm(false);
      } else {
        toast.error(res.data?.message || 'Withdrawal request failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to process withdrawal';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
          Withdraw <span className="text-emerald-500">Funds</span>
        </h1>
        <p className="text-emerald-500/70 text-sm font-medium mt-2">
          Secure withdrawal • Minimum €50 • Usually processed within 24-48 hours
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {!showConfirm ? (
          // Form Step
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-3xl p-10 space-y-8">
            <div>
              <label className="block text-xs text-gray-500 mb-3">Available Balance</label>
              <div className="text-5xl font-black text-white">
                €{availableEUR.toLocaleString('de-DE')}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-3">Withdrawal Amount (€)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl text-gray-500">€</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50.00"
                  min="50"
                  step="0.01"
                  className="w-full bg-black border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-4xl font-bold focus:border-emerald-500 outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Minimum: €50</p>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-3">Destination Address / IBAN</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your wallet address or bank details"
                className="w-full bg-black border border-white/10 rounded-2xl py-6 px-6 font-mono text-sm focus:border-emerald-500 outline-none"
              />
              <p className="text-xs text-amber-500 mt-3 flex items-center gap-2">
                <AlertTriangle size={14} /> 
                Double-check the address. Transactions are irreversible.
              </p>
            </div>

            <button
              type="submit"
              disabled={!amount || parseFloat(amount) < 50 || !address.trim()}
              className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-3"
            >
              <ArrowUpCircle size={22} />
              Review & Confirm Withdrawal
            </button>
          </form>
        ) : (
          // Confirmation Step
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 space-y-8">
            <div className="text-center">
              <CheckCircle className="mx-auto text-emerald-500" size={64} />
              <h3 className="text-2xl font-bold mt-6">Confirm Withdrawal</h3>
            </div>

            <div className="bg-black/60 rounded-2xl p-8 space-y-6 text-lg">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="font-bold">€{parseFloat(amount).toLocaleString('de-DE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Destination</span>
                <span className="font-mono text-sm break-all text-right max-w-xs">{address}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-6">
                <span className="text-gray-400">Remaining Balance</span>
                <span>€{(availableEUR - parseFloat(amount)).toLocaleString('de-DE')}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-5 border border-white/20 rounded-2xl font-bold hover:bg-white/5"
              >
                Back
              </button>
              <button
                onClick={confirmWithdrawal}
                disabled={loading}
                className="flex-1 py-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 text-black font-bold rounded-2xl flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    <ShieldCheck size={22} /> Confirm Withdrawal
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-gray-500">
              This request will be reviewed and processed within 24-48 hours.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
