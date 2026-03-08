import React, { useState } from 'react';
import api from '../../api/api';
import { API_ENDPOINTS } from '../../constants/api';
import { toast } from 'react-hot-toast';
import { Wallet, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';

const WithdrawalRequest = ({ balances, onAccountUpdate }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const available = balances[currency] || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(amount) > available) return toast.error('Insufficient funds in selected wallet');
    if (Number(amount) <= 0) return toast.error('Please enter a valid amount');

    try {
      setLoading(true);
      // This hits the user-side ledger route
      const { data } = await api.post('/user/withdraw', {
        amount: Number(amount),
        currency,
        address,
        description: `Withdrawal to ${address.substring(0, 8)}...`
      });

      toast.success('Withdrawal request submitted for Zurich approval');
      setAmount('');
      setAddress('');
      
      // Refresh user data locally to reflect the "pending" deduction
      if (onAccountUpdate) onAccountUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal protocol failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-500/10 rounded-lg">
          <Wallet className="text-yellow-500" size={20} />
        </div>
        <h3 className="text-lg font-bold text-white">Request Withdrawal</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* WALLET SELECTION */}
        <div className="grid grid-cols-2 gap-3">
          {['EUR', 'ROI'].map((ticker) => (
            <button
              key={ticker}
              type="button"
              onClick={() => setCurrency(ticker)}
              className={`p-3 rounded-xl border transition-all text-sm font-medium ${
                currency === ticker 
                ? 'border-yellow-500 bg-yellow-500/10 text-white' 
                : 'border-gray-800 bg-black/20 text-gray-400 hover:border-gray-700'
              }`}
            >
              {ticker} Wallet
              <span className="block text-[10px] opacity-60">
                €{(balances[ticker] || 0).toLocaleString()} available
              </span>
            </button>
          ))}
        </div>

        {/* AMOUNT INPUT */}
        <div>
          <label className="text-xs text-gray-500 uppercase font-bold ml-1">Amount</label>
          <div className="relative mt-1">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-yellow-500 transition-colors"
              required
            />
            <span className="absolute left-4 top-3.5 text-gray-500 text-sm">€</span>
            <button 
              type="button"
              onClick={() => setAmount(available)}
              className="absolute right-3 top-2 text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded hover:bg-gray-700"
            >
              MAX
            </button>
          </div>
        </div>

        {/* ADDRESS/DESTINATION */}
        <div>
          <label className="text-xs text-gray-500 uppercase font-bold ml-1">Destination Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. BTC/USDT Address or IBAN"
            className="w-full mt-1 bg-black/40 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            required
          />
        </div>

        {/* SECURITY NOTE */}
        <div className="flex gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
          <AlertCircle size={16} className="text-blue-400 shrink-0" />
          <p className="text-[10px] text-blue-300/80 leading-relaxed">
            Requests are processed manually by the Zurich treasury. Average synchronization time: 2-6 hours.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowUpRight size={20} /> Confirm Withdrawal</>}
        </button>
      </form>
    </div>
  );
};

export default WithdrawalRequest;
