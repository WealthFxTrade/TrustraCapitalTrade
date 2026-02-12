import React, { useState } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { ArrowUpRight, ShieldCheck, Wallet } from 'lucide-react';

export default function WithdrawalForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    asset: 'BTC',
    address: '',
    walletType: 'main'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Client-Side Validation
    if (!formData.amount || Number(formData.amount) < 50) {
      return toast.error("Minimum withdrawal is €50.00");
    }
    if (formData.address.length < 25) {
      return toast.error(`Please enter a valid ${formData.asset} address`);
    }

    setLoading(true);
    try {
      // 2. Transmit to Trustra Security Node
      const res = await api.post('/withdraw/request', formData);
      
      toast.success(res.data.message || "Withdrawal Transmitted");
      
      // 3. Reset Form on Success
      setFormData({ ...formData, amount: '', address: '' });
      
      // Trigger parent refresh (to update balance/ledger)
      if (onSuccess) onSuccess();
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-[#0f121d] rounded-[2.5rem] border border-white/5 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
          <ArrowUpRight className="text-rose-500" /> Capital Withdrawal
        </h2>
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 uppercase">
          <ShieldCheck size={12} /> SECURE NODE
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Wallet Selection */}
        <div className="grid grid-cols-2 gap-4">
          {['main', 'profit'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData({...formData, walletType: type})}
              className={`p-4 rounded-2xl border transition-all uppercase text-[10px] font-black tracking-widest flex flex-col items-center gap-2 ${
                formData.walletType === type 
                ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20 text-white' 
                : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
              }`}
            >
              <Wallet size={16} />
              {type} Wallet
            </button>
          ))}
        </div>

        {/* ✅ Asset Selection */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2">
            Gateway Asset
          </label>
          <select 
            value={formData.asset}
            onChange={(e) => setFormData({...formData, asset: e.target.value})}
            className="w-full bg-[#0a0d14] text-xs font-mono focus:outline-none text-indigo-400 p-2 rounded-lg border border-white/5"
          >
            {['BTC', 'ETH', 'USDT'].map((coin) => (
              <option key={coin} value={coin} className="bg-[#0f121d] text-white">{coin}</option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 transition-colors">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2">
            Amount (EUR)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-bold">€</span>
            <input 
              type="number" 
              placeholder="50.00"
              value={formData.amount}
              className="w-full bg-transparent text-xl font-black focus:outline-none placeholder:text-gray-800"
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>
        </div>

        {/* Address Input */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 transition-colors">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2">
            Destination {formData.asset} Address
          </label>
          <input 
            type="text" 
            placeholder={`Paste your ${formData.asset} wallet address`}
            value={formData.address}
            className="w-full bg-transparent text-xs font-mono focus:outline-none text-indigo-400 placeholder:text-gray-800"
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        {/* Action Button */}
        <button 
          type="submit"
          disabled={loading}
          className={`w-full p-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
            loading 
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20'
          }`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
          ) : (
            <ShieldCheck size={18} />
          )}
          {loading ? 'Transmitting...' : 'Authorize Withdrawal'}
        </button>
      </form>
    </div>
  );
}

