import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { ArrowUpRight, ShieldCheck, Info, Loader2, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Withdraw() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || !address) return toast.error("Please fill all security fields");

    setLoading(true);
    try {
      const { data } = await api.post('/user/withdraw', { 
        amount: parseFloat(amount), 
        externalAddress: address 
      });
      toast.success("Withdrawal protocol initiated. Check your email for confirmation.");
      setAmount('');
      setAddress('');
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 animate-in fade-in duration-700">
      <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative">
        <h1 className="text-2xl font-black italic uppercase mb-8">Secure <span className="text-yellow-500">Withdrawal</span></h1>

        <form onSubmit={handleWithdraw} className="space-y-6">
          {/* Amount Field */}
          <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
            <div className="flex justify-between mb-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount (EUR)</span>
              <span className="text-[10px] font-black text-yellow-500">Available: €{user?.balances?.EUR?.toLocaleString() || 0}</span>
            </div>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-2xl font-bold w-full outline-none placeholder:text-gray-800"
              placeholder="0.00"
            />
          </div>

          {/* Destination Field */}
          <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Destination BTC Address</span>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-transparent text-sm font-mono text-yellow-500 w-full outline-none placeholder:text-gray-800"
              placeholder="bc1q..."
            />
          </div>

          <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex gap-3">
            <Smartphone size={16} className="text-yellow-500 shrink-0" />
            <p className="text-[10px] text-gray-500 leading-relaxed italic">
              A 2FA verification code will be sent to your registered contact method to authorize this transaction.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowUpRight size={20} />}
            Initiate Withdrawal
          </button>
        </form>
      </div>
    </div>
  );
}
