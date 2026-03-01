import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { 
  ArrowUpRight, ShieldAlert, CreditCard, 
  Wallet, Info, Loader2, Lock 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Withdraw() {
  const { user, setUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const isVerified = user?.kycStatus === 'verified';

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!isVerified) return toast.error("Account Audit Required for Extraction");
    if (amount > user?.balances?.total) return toast.error("Insufficient Liquidity");

    setLoading(true);
    try {
      const { data } = await api.post('/transactions/withdraw', { amount, address });
      toast.success("Extraction Protocol Initiated");
      setUser({ ...user, balances: data.newBalances });
      setAmount('');
      setAddress('');
    } catch (err) {
      toast.error(err.response?.data?.message || "Node Communication Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-12 space-y-12 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Capital <span className="text-yellow-500">Extraction</span>
        </h1>
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] italic">
          Secure gateway for institutional fund settlement.
        </p>
      </header>

      <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 bg-[#0a0c10] border border-white/5 p-8 md:p-12 rounded-[3rem] shadow-2xl">
          {!isVerified ? (
            <div className="text-center py-10 space-y-6">
              <div className="bg-rose-500/10 p-6 rounded-full w-fit mx-auto text-rose-500">
                <Lock size={40} />
              </div>
              <h3 className="text-xl font-black uppercase italic">Extraction Locked</h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto leading-loose">
                Your Identity Node has not been verified. Complete KYC to unlock withdrawals.
              </p>
              <button 
                onClick={() => window.location.href = '/kyc'}
                className="px-10 py-4 bg-white text-black text-[10px] font-black uppercase rounded-2xl hover:bg-yellow-500 transition-all"
              >
                Go to KYC Audit
              </button>
            </div>
          ) : (
            <form onSubmit={handleWithdraw} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Extraction Amount (EUR)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-2xl font-black italic text-white outline-none focus:border-yellow-500/50"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Destination Wallet / IBAN</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm font-mono text-white outline-none focus:border-yellow-500/50"
                  placeholder="Enter destination details..."
                />
              </div>

              <button 
                disabled={loading}
                className="w-full py-6 bg-yellow-500 hover:bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 disabled:opacity-20 shadow-xl shadow-yellow-500/10"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Request Settlement <ArrowUpRight size={18} /></>}
              </button>
            </form>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-yellow-500/5 border border-yellow-500/10 p-8 rounded-[2.5rem]">
            <h4 className="text-[10px] font-black uppercase text-yellow-500 mb-4 tracking-widest flex items-center gap-2">
              <ShieldAlert size={14} /> Security Protocol
            </h4>
            <ul className="space-y-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
              <li>• 24h Processing window</li>
              <li>• Institutional gas fees apply</li>
              <li>• Max €50k/day for Elite nodes</li>
            </ul>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem]">
            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
              <Info size={14} /> Available Balance
            </h4>
            <p className="text-3xl font-black italic text-white">€{user?.balances?.total?.toLocaleString() || '0.00'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
