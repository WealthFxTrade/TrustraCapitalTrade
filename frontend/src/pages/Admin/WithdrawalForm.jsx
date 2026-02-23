import React, { useState } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function WithdrawalForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    amount: '',
    asset: 'BTC',
    address: '',
    walletType: 'main' // default
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/withdraw/request', formData);
      toast.success(res.data.message);
      setFormData({ ...formData, amount: '', address: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-[#0f121d] rounded-[2.5rem] border border-white/5 shadow-2xl">
      <h2 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-2">
        <ArrowUpRight className="text-rose-500" /> Capital Withdrawal
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {['main', 'profit'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData({...formData, walletType: type})}
              className={`p-4 rounded-2xl border transition-all uppercase text-[10px] font-black tracking-widest ${
                formData.walletType === type 
                ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20' 
                : 'bg-white/5 border-white/10 text-gray-500'
              }`}
            >
              {type} Wallet
            </button>
          ))}
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2">
            Amount (EUR)
          </label>
          <input 
            type="number" 
            placeholder="Min: 50.00"
            value={formData.amount}
            className="w-full bg-transparent text-xl font-black focus:outline-none"
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
          />
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2">
            Destination {formData.asset} Address
          </label>
          <input 
            type="text" 
            placeholder={`Enter ${formData.asset} address`}
            value={formData.address}
            className="w-full bg-transparent text-xs font-mono focus:outline-none text-indigo-400"
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className={`w-full p-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${
            loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 text-white'
          }`}
        >
          <ShieldCheck size={18} /> {loading ? 'Processing...' : 'Authorize Withdrawal'}
        </button>
      </form>
    </div>
  );
}
