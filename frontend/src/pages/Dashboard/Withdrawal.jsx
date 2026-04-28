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
import api, { API_ENDPOINTS } from '../../constants/api';
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
      const res = await api.post(API_ENDPOINTS.USER.WITHDRAW, {
        amount: numAmount,
        address: address.trim(),
      });

      if (res.data?.success) {
        toast.success(
          `Withdrawal of €${numAmount.toLocaleString('de-DE')} requested successfully!`
        );

        if (refreshBalances) refreshBalances();

        setAmount('');
        setAddress('');
        setShowConfirm(false);
      } else {
        toast.error(res.data?.message || 'Withdrawal request failed');
      }
    } catch (err) {
      console.error('WITHDRAW ERROR:', err.response || err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Network error. Try again.';

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {!showConfirm ? (
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />

          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Wallet address"
          />

          <button type="submit">Withdraw</button>
        </form>
      ) : (
        <div>
          <p>Confirm €{amount}</p>
          <button onClick={confirmWithdrawal}>
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      )}
    </div>
  );
}
