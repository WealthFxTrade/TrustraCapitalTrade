import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/apiService';
import toast from 'react-hot-toast';

export default function Withdraw() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (Number(amount) < 10) return toast.error("Minimum withdrawal is $10");

    try {
      setLoading(true);
      await api.post('/transactions/withdraw', { 
        amount: Number(amount), 
        walletAddress: address,
        currency: 'BTC' 
      });
      toast.success("Withdrawal request submitted for approval");
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="max-w-md mx-auto bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6">
        <div className="text-center">
          <Wallet className="mx-auto h-12 w-12 text-indigo-500 mb-2" />
          <h1 className="text-2xl font-bold">Request Withdrawal</h1>
          <p className="text-gray-400 text-sm">Funds are deducted instantly from your balance.</p>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Amount (USD)</label>
            <input 
              type="number" 
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 mt-1 outline-none focus:border-indigo-500 transition"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Destination BTC Address</label>
            <input 
              type="text" 
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 mt-1 outline-none focus:border-indigo-500 transition font-mono text-sm"
              placeholder="bc1q..."
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold transition flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Submit Withdrawal"}
          </button>
        </form>

        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3">
          <AlertCircle className="text-amber-500 shrink-0" size={18} />
          <p className="text-[10px] text-amber-200 leading-relaxed">
            Withdrawals are processed manually within 24 hours. Please double-check your wallet address; transactions cannot be reversed.
          </p>
        </div>
      </div>
    </div>
  );
}

