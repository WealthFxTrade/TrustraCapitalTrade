import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

import {
  getDepositAddress,
  getDepositHistory,
  createFiatDeposit,
} from '../api';

function Alert({ type, children }) {
  const styles = {
    error: 'bg-red-900/50 border-red-700 text-red-300',
    success: 'bg-green-900/50 border-green-700 text-green-300',
  };
  const Icon = type === 'error' ? AlertCircle : CheckCircle;

  return (
    <div className={`mb-6 p-4 rounded-lg border flex gap-3 ${styles[type]}`}>
      <Icon className="h-5 w-5 mt-1" />
      <span>{children}</span>
    </div>
  );
}

export default function Deposit() {
  const navigate = useNavigate();

  const [method, setMethod] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [deposit, setDeposit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadDeposit = useCallback(async (fresh = false) => {
    try {
      setLoading(true);
      const res = await getDepositAddress(method, fresh);
      setDeposit(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load deposit address');
    } finally {
      setLoading(false);
    }
  }, [method]);

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await getDepositHistory(method);
      setHistory(res.data || []);
    } catch {
      toast.error('Failed to load deposit history');
    } finally {
      setHistoryLoading(false);
    }
  }, [method]);

  useEffect(() => {
    loadDeposit();
    loadHistory();
    const interval = setInterval(loadHistory, 60000);
    return () => clearInterval(interval);
  }, [loadDeposit, loadHistory]);

  const copyAddress = () => {
    navigator.clipboard.writeText(deposit.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const submitFiat = async (e) => {
    e.preventDefault();
    const value = Number(amount);

    if (!value || value < 100) {
      toast.error('Minimum deposit is $100');
      return;
    }

    try {
      setLoading(true);
      await createFiatDeposit({ amount: value, method });
      toast.success('Deposit request submitted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex justify-center p-6">
      <div className="w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8 flex items-center justify-center gap-3">
          <DollarSign className="text-green-500" />
          Deposit Funds
        </h1>

        {/* METHOD */}
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full mb-6 p-3 bg-gray-800 border border-gray-700 rounded-lg"
        >
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="USDT">USDT (TRC20)</option>
          <option value="BANK">Bank Transfer</option>
        </select>

        {/* CRYPTO */}
        {deposit && (method === 'BTC' || method === 'USDT') && (
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h3 className="font-semibold">Deposit Address</h3>

            <QRCode value={deposit.address} size={160} />

            <div className="flex gap-2 bg-gray-900 p-3 rounded-lg font-mono">
              <span className="truncate">{deposit.address}</span>
              <button onClick={copyAddress}>
                {copied ? <Check /> : <Copy />}
              </button>
            </div>

            <button
              onClick={() => loadDeposit(true)}
              className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded"
            >
              <RefreshCw size={16} /> New Address
            </button>

            <p className="text-sm text-gray-400">
              Status: <strong>{deposit.status}</strong>
            </p>
          </div>
        )}

        {/* FIAT */}
        {method === 'BANK' && (
          <form onSubmit={submitFiat} className="space-y-4">
            <input
              type="number"
              min="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (USD)"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
            />
            <button
              disabled={loading}
              className="w-full bg-green-600 py-3 rounded-lg font-bold"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Submit'}
            </button>
          </form>
        )}

        {/* HISTORY */}
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Deposit History</h3>
          {historyLoading ? (
            <p>Loading…</p>
          ) : history.length === 0 ? (
            <p className="text-gray-400">No deposits yet.</p>
          ) : (
            history.map((d) => (
              <div key={d._id} className="border-b border-gray-700 py-2">
                {d.amount} • {d.status} • {new Date(d.createdAt).toLocaleString()}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
