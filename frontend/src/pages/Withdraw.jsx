import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { TrendingUp, Wallet, ArrowLeft, ShieldCheck, AlertCircle, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWallet } from '../api/walletApi';
import { getWithdrawals, requestWithdrawal } from '../api/withdrawalApi';

export default function Withdraw() {
  const navigate = useNavigate();
  const [amountSat, setAmountSat] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);

  // 2026 BTC Price for UI context (~$77,494)
  const satToUsd = (sats) => ((sats / 100000000) * 77494).toLocaleString(undefined, { minimumFractionDigits: 2 });

  const fetchData = async () => {
    try {
      const [walletRes, withdrawRes] = await Promise.all([getWallet(), getWithdrawals()]);
      setWallet(walletRes.data);
      setWithdrawals(withdrawRes.data);
    } catch (err) {
      toast.error('Security Sync Failed: Unable to load wallet');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!amountSat || !btcAddress) return toast.error('Required fields missing');
    
    const sats = Number(amountSat);
    if (sats <= 0) return toast.error('Invalid amount');
    if (!wallet) return toast.error('Wallet offline');
    if (sats > wallet.availableSat) return toast.error('Insufficient available balance');
    
    const hasPending = withdrawals.some(w => w.status === 'pending');
    if (hasPending) return toast.error('Active request already in progress');

    setLoading(true);
    try {
      await requestWithdrawal({ amountSat: sats, btcAddress });
      toast.success('Payout request transmitted to blockchain');
      setAmountSat('');
      setBtcAddress('');
      await fetchData(); // Refresh data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono animate-pulse">
      Initialising Secure Wallet Tunnel...
    </div>
  );

  const pendingWithdrawal = withdrawals.find(w => w.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 selection:bg-indigo-500/30">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 mb-8 hover:text-white transition group">
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition" /> <span>Dashboard</span>
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600"></div>
          
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Withdraw Assets</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Network: Bitcoin Mainnet</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Available</p>
              <p className="text-xl font-mono font-bold text-emerald-400">{wallet.availableSat.toLocaleString()} <span className="text-[10px]">sats</span></p>
            </div>
          </div>

          {/* Pending Alert */}
          {pendingWithdrawal && (
            <div className="mb-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3 animate-pulse">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-200/80 leading-relaxed">
                A payout of <span className="font-bold">{pendingWithdrawal.amountSat.toLocaleString()} sats</span> is currently under security review.
              </p>
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Destination Address</label>
              <input
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-indigo-400 placeholder-slate-700 focus:border-indigo-500 transition outline-none"
                placeholder="bc1q..."
                value={btcAddress}
                onChange={(e) => setBtcAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Amount (Satoshi)</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xl font-mono text-white placeholder-slate-700 focus:border-indigo-500 transition outline-none"
                  placeholder="0"
                  value={amountSat}
                  onChange={(e) => setAmountSat(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600">SATS</span>
              </div>
              {amountSat > 0 && (
                <p className="text-[10px] text-slate-500 mt-1 ml-1 italic">
                  ≈ Estimated Value: <span className="text-slate-300 font-bold">${satToUsd(amountSat)} USD</span>
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !!pendingWithdrawal}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition shadow-lg ${
                loading || !!pendingWithdrawal
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              {loading ? 'Transmitting...' : 'Request Payout'}
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 flex justify-center items-center gap-2 text-slate-600">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">2FA & Multi-Sig Protected Transfer</span>
        </div>
      </div>
    </div>
  );
}

