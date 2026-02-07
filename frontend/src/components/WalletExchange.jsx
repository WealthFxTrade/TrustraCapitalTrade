import React, { useState } from 'react';
import { ArrowRightLeft, Wallet, RefreshCw, TrendingUp } from 'lucide-react';
import api from '../api/apiService';
import toast from 'react-hot-toast';

export default function WalletExchange() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExchange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/transactions/reinvest', { amount: Number(amount) });
      toast.success("Transfer Successful");
      setAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || "Transfer Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-[#161b29] border border-gray-800 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <ArrowRightLeft className="text-indigo-500" /> Wallet Exchange
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#0f121d] p-4 rounded-2xl border border-gray-800">
            <p className="text-[10px] text-gray-500 uppercase font-black">From: Profit</p>
            <TrendingUp size={16} className="text-green-500 my-2" />
          </div>
          <div className="bg-[#0f121d] p-4 rounded-2xl border border-gray-800">
            <p className="text-[10px] text-gray-500 uppercase font-black">To: Main</p>
            <Wallet size={16} className="text-indigo-500 my-2" />
          </div>
        </div>

        <form onSubmit={handleExchange} className="space-y-6">
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount to Transfer (€)"
            className="w-full bg-[#05070a] border border-gray-800 p-4 rounded-xl font-bold focus:border-indigo-500 outline-none"
          />
          <button disabled={loading} className="w-full bg-indigo-600 py-4 rounded-xl font-black uppercase text-xs tracking-widest transition">
            {loading ? <RefreshCw className="animate-spin mx-auto" /> : "Confirm Exchange"}
          </button>
        </form>
      </div>
    </div>
  );
}

