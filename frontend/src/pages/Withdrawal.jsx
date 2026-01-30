// src/pages/Withdrawal.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

export default function Withdrawal({ userBalance = 0 }) { // pass balance from dashboard if needed
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('crypto');
  const [btcAddress, setBtcAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      setLoading(false);
      return;
    }

    if (withdrawAmount > userBalance) {
      setError('Insufficient balance');
      setLoading(false);
      return;
    }

    if (method === 'crypto' && !btcAddress.trim()) {
      setError('Bitcoin wallet address is required for crypto withdrawals');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/transactions/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          method,
          btcAddress: method === 'crypto' ? btcAddress.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Withdrawal request failed');
      }

      setSuccess('Withdrawal request submitted successfully! An admin will review it shortly.');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8">
        <h1 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
          <DollarSign className="h-8 w-8 text-red-500" />
          Withdraw Funds
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-1 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-300 flex items-center gap-3">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100.00"
              min="1"
              step="0.01"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Available: ${userBalance.toLocaleString() || '0.00'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Withdrawal Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
              disabled={loading}
            >
              <option value="crypto">Cryptocurrency (BTC)</option>
              <option value="bank">Bank Transfer</option>
              <option value="wallet">E-Wallet</option>
            </select>
          </div>

          {method === 'crypto' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bitcoin Wallet Address
              </label>
              <input
                type="text"
                value={btcAddress}
                onChange={(e) => setBtcAddress(e.target.value.trim())}
                placeholder="bc1q... or 1... or 3..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                required
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Submit Withdrawal Request'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Withdrawals are reviewed by admins. Minimum $50. Processing time: 1–24 hours.
        </p>
      </div>
    </div>
  );
}
