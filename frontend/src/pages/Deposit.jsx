// src/pages/Deposit.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { DollarSign, AlertCircle, CheckCircle, Loader2, FaSyncAlt, FaCopy, FaCheck } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

export default function Deposit() {
  const [method, setMethod] = useState('crypto'); // crypto, bank, wallet
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Crypto-specific state
  const [deposit, setDeposit] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Alert component
  const Alert = ({ type, children }) => {
    const base = 'mb-6 p-4 rounded-lg flex items-start gap-3';
    const classes = {
      error: `${base} bg-red-900/50 border border-red-700 text-red-300`,
      success: `${base} bg-green-900/50 border border-green-700 text-green-300`,
    };
    const Icon = type === 'error' ? AlertCircle : CheckCircle;
    return (
      <div className={classes[type]}>
        <Icon className="h-5 w-5 mt-1 flex-shrink-0" />
        <span>{children}</span>
      </div>
    );
  };

  // =========================
  // Non-Crypto Deposit
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (method !== 'crypto') {
      const depositAmount = parseFloat(amount);
      if (!depositAmount || depositAmount <= 0) {
        setError('Please enter a valid amount greater than 0');
        setLoading(false);
        return;
      }
      if (depositAmount < 100) {
        setError('Minimum deposit amount is $100');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/transactions/deposit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: depositAmount,
            method,
            currency: method === 'crypto' ? 'BTC' : 'USD',
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Deposit request failed');

        setSuccess('Deposit request submitted successfully! An admin will review it shortly.');
        setAmount('');
        setTimeout(() => navigate('/dashboard'), 3000);
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // =========================
  // BTC Deposit
  // =========================
  const fetchDeposit = useCallback(async (fresh = false) => {
    try {
      setLoading(true);
      setError('');
      const url = `${BACKEND_URL}/api/deposits/btc${fresh ? '?fresh=true' : ''}`;
      const { data } = await axios.get(url, { withCredentials: true });

      if (data.success) setDeposit(data.data);
      else throw new Error(data.message || 'Invalid response');
    } catch (err) {
      console.error('Deposit fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load deposit address');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setError('');
      const { data } = await axios.get(`${BACKEND_URL}/api/deposits/btc/history`, { withCredentials: true });

      if (data.success) setHistory(data.data || []);
      else throw new Error(data.message || 'Invalid response');
    } catch (err) {
      console.error('History fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load deposit history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (method === 'crypto') {
      fetchDeposit();
      fetchHistory();
      const interval = setInterval(fetchHistory, 60000);
      return () => clearInterval(interval);
    }
  }, [method, fetchDeposit, fetchHistory]);

  const copyAddress = () => {
    if (deposit?.address) {
      navigator.clipboard.writeText(deposit.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8 space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center flex items-center justify-center gap-3 mb-6">
          <DollarSign className="h-10 w-10 text-green-500" />
          Deposit Funds
        </h1>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition disabled:opacity-50"
            disabled={loading}
          >
            <option value="crypto">Cryptocurrency (BTC)</option>
            <option value="bank">Bank Transfer / Wire</option>
            <option value="wallet">E-Wallet (Perfect Money, Payeer, etc.)</option>
          </select>
        </div>

        {/* Crypto Deposit */}
        {method === 'crypto' && deposit && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-2">BTC Deposit Address</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-gray-900 rounded-lg shadow-inner">
                <QRCode value={deposit.address} size={160} level="H" fgColor="#00ff00" bgColor="#1f2937" />
              </div>
              <div className="flex-1 min-w-[280px] space-y-2">
                <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg font-mono">
                  <code className="truncate">{deposit.address}</code>
                  <button onClick={copyAddress} className="text-green-500">
                    {copied ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
                <p className="text-sm">
                  Status:{' '}
                  <span
                    className={deposit.status === 'confirmed' ? 'text-green-500 font-semibold' : 'text-yellow-500 font-semibold'}
                  >
                    {deposit.status.toUpperCase()}
                  </span>
                </p>
                <p className="text-sm">Created: {new Date(deposit.createdAt).toLocaleString()}</p>
                <button
                  onClick={() => fetchDeposit(true)}
                  className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
                  disabled={loading}
                >
                  <FaSyncAlt /> Generate New Address
                </button>
              </div>
            </div>

            {/* Deposit History */}
            <div>
              <h4 className="font-semibold mb-2">Deposit History</h4>
              {historyLoading ? (
                <p>Loading history...</p>
              ) : history.length === 0 ? (
                <p>No deposit history yet.</p>
              ) : (
                <div className="overflow-x-auto border border-gray-700 rounded-lg">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="p-2">ID</th>
                        <th className="p-2">Address</th>
                        <th className="p-2">Amount</th>
                        <th className="p-2">Received</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Confirmations</th>
                        <th className="p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((dep) => (
                        <tr key={dep._id} className="border-b border-gray-700">
                          <td>{dep._id.slice(0, 8)}...</td>
                          <td>{dep.address.slice(0, 8)}...{dep.address.slice(-6)}</td>
                          <td>{Number(dep.amount || 0).toFixed(8)}</td>
                          <td>{Number(dep.receivedAmount || 0).toFixed(8)}</td>
                          <td
                            className={dep.status === 'confirmed' ? 'text-green-500 font-bold' : 'text-yellow-500 font-bold'}
                          >
                            {dep.status.toUpperCase()}
                          </td>
                          <td>{dep.confirmations || 0}</td>
                          <td>{new Date(dep.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Non-Crypto Deposit Form */}
        {method !== 'crypto' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                min="100"
                step="0.01"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition disabled:opacity-50"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Minimum deposit: $100. Maximum per transaction: $50,000.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition ${
                loading ? 'bg-green-800 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit Deposit Request'
              )}
            </button>
          </form>
        )}

        {/* Security & Info */}
        <div className="mt-6 space-y-4 text-sm text-gray-400">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-1" />
            <p>
              Deposits are manually reviewed by admins. Processing time: 1–24 hours. Crypto deposits require 3 confirmations.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
            <p>
              Never send funds from an exchange directly. Use a personal wallet. We are not responsible for lost funds due to user error.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
