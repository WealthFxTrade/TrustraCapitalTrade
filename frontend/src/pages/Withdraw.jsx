import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ShieldAlert, Loader2, Coins } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function Withdraw() {
  const [formData, setFormData] = useState({ amount: '', currency: 'USDT', address: '' });
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!formData.address || formData.address.length < 10) return toast.error("Invalid Destination Address");

    setLoading(true);
    try {
      const { data } = await api.post('/users/withdraw/request', formData);
      toast.success(data.message);
      setFormData({ amount: '', currency: 'USDT', address: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Extraction Denied");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Extraction Protocol</h2>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">ROI Vault Output • Zurich Mainnet</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* WITHDRAWAL FORM */}
        <div className="md:col-span-2 bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-3xl">
          <form onSubmit={handleWithdraw} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Asset</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500"
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                >
                  <option value="USDT">USDT (TRC20)</option>
                  <option value="BTC">Bitcoin</option>
                  <option value="ETH">Ethereum</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Amount</label>
                <input 
                  type="number" required placeholder="0.00"
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Destination Address</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="text" required placeholder="Enter Wallet Address"
                  className="w-full bg-black/40 border border-white/10 p-4 pl-12 rounded-xl text-white outline-none focus:border-yellow-500 font-mono text-xs"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-white text-black font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 italic uppercase tracking-tighter hover:bg-yellow-500"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Initialize Extraction <ArrowUpRight size={18} /></>}
            </button>
          </form>
        </div>

        {/* SECURITY SIDEBAR */}
        <div className="space-y-4">
          <div className="bg-yellow-500/5 border border-yellow-500/10 p-6 rounded-[2rem]">
            <ShieldAlert className="text-yellow-500 mb-4" size={24} />
            <h4 className="text-[10px] font-black uppercase text-yellow-500 mb-2">Protocol Note</h4>
            <p className="text-[9px] leading-relaxed text-yellow-500/60 uppercase font-bold">
              All extractions undergo manual verification by Zurich HQ. Process time: 1-12 hours.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
            <Coins className="text-gray-400 mb-4" size={24} />
            <h4 className="text-[10px] font-black uppercase text-white mb-2">Network Fees</h4>
            <p className="text-[9px] leading-relaxed text-gray-500 uppercase font-bold">
              USDT: 1.00 <br/>
              BTC: 0.0002 <br/>
              ETH: 0.005
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
