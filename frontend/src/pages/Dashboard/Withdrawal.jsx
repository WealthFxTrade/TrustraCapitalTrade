// src/pages/Dashboard/Withdrawal.jsx
import React, { useState } from 'react';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

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

    if (!numAmount || numAmount < 50) {
      return toast.error('Minimum withdrawal amount is €50');
    }

    if (numAmount > availableEUR) {
      return toast.error('Amount exceeds available balance');
    }

    if (!cleanAddress) {
      return toast.error('Please enter a valid destination address');
    }

    setShowConfirm(true);
  };

  const confirmWithdrawal = async () => {
    if (loading) return; // 🚫 prevent double click

    const numAmount = parseAmount();
    const cleanAddress = address.trim();

    setLoading(true);

    try {
      const res = await api.post(API_ENDPOINTS.USER.WITHDRAW, {
        amount: numAmount,
        address: cleanAddress,
      });

      if (res.data?.success) {
        toast.success(
          `Withdrawal of €${numAmount.toLocaleString('de-DE')} requested successfully!`
        );

        // refresh dashboard balances
        if (refreshBalances) await refreshBalances();

        // reset form
        setAmount('');
        setAddress('');
        setShowConfirm(false);
      } else {
        throw new Error(res.data?.message || 'Withdrawal failed');
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <p>
            Available: €{availableEUR.toLocaleString('de-DE')}
          </p>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            min="50"
          />

          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Wallet address / IBAN"
          />

          <button
            type="submit"
            disabled={!amount || Number(amount) < 50 || !address.trim()}
          >
            Withdraw
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <p>
            Confirm withdrawal of €{parseAmount().toLocaleString('de-DE')}
          </p>

          <p className="text-sm text-gray-500 break-all">
            {address}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => !loading && setShowConfirm(false)}
              disabled={loading}
            >
              Back
            </button>

            <button
              onClick={confirmWithdrawal}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
