import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getWallet } from '../api/walletApi';
import { getWithdrawals, requestWithdrawal } from '../api/withdrawalApi';

export default function Withdraw() {
  const [amountSat, setAmountSat] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch wallet and pending withdrawals on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const walletRes = await getWallet();
        setWallet(walletRes.data);

        const withdrawRes = await getWithdrawals();
        setWithdrawals(withdrawRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load wallet data');
      }
    }

    fetchData();
  }, []);

  const submit = async () => {
    if (!amountSat || !btcAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    const sats = Number(amountSat);
    if (sats <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (!wallet) {
      toast.error('Wallet not loaded yet');
      return;
    }

    // Check available balance
    if (sats > wallet.availableSat) {
      toast.error('Amount exceeds available balance');
      return;
    }

    // Check pending withdrawal
    const hasPending = withdrawals.some(w => w.status === 'pending');
    if (hasPending) {
      toast.error('You already have a pending withdrawal');
      return;
    }

    setLoading(true);
    try {
      await requestWithdrawal({ amountSat: sats, btcAddress });
      toast.success('Withdrawal request submitted!');

      // Clear inputs
      setAmountSat('');
      setBtcAddress('');

      // Refresh wallet and withdrawals
      const walletRes = await getWallet();
      setWallet(walletRes.data);

      const withdrawRes = await getWithdrawals();
      setWithdrawals(withdrawRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading wallet data...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Withdraw Bitcoin</h2>

      {/* Wallet Summary */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p><strong>Total Balance:</strong> {wallet.balanceSat.toLocaleString()} sats</p>
        <p><strong>Locked (Pending):</strong> {wallet.lockedSat.toLocaleString()} sats</p>
        <p className="text-green-400"><strong>Available:</strong> {wallet.availableSat.toLocaleString()} sats</p>
      </div>

      {/* Pending Withdrawal Alert */}
      {withdrawals.some(w => w.status === 'pending') && (
        <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-300">
          You have a pending withdrawal. You cannot submit a new request until it is processed.
        </div>
      )}

      <input
        className="w-full mb-3 p-3 bg-gray-800 border border-gray-700 rounded-lg placeholder-gray-400"
        placeholder="BTC Address"
        value={btcAddress}
        onChange={(e) => setBtcAddress(e.target.value)}
      />

      <input
        className="w-full mb-3 p-3 bg-gray-800 border border-gray-700 rounded-lg placeholder-gray-400"
        placeholder="Amount (sats)"
        type="number"
        value={amountSat}
        onChange={(e) => setAmountSat(e.target.value)}
        min="1"
      />

      <button
        onClick={submit}
        disabled={loading || withdrawals.some(w => w.status === 'pending')}
        className={`w-full py-3 mt-2 rounded-lg font-semibold text-black ${
          loading || withdrawals.some(w => w.status === 'pending')
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-yellow-500 hover:bg-yellow-600'
        }`}
      >
        {loading ? 'Processing...' : 'Request Withdrawal'}
      </button>
    </div>
  );
}
