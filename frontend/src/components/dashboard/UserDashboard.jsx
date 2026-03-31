// src/components/dashboard/UserDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, coins, RefreshCcw, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AssetCard from './AssetCard.jsx';
import WalletDisplay from './WalletDisplay.jsx';
import ActivityLedger from './ActivityLedger.jsx';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [balances, setBalances] = useState({});
  const [wallet, setWallet] = useState('');
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch balances (Matching your backend response structure)
      const balancesRes = await axios.get(`${API_URL}/user/balances`, { withCredentials: true });
      if (balancesRes.data?.success) {
        setBalances(balancesRes.data.balances || {});
      }

      // 2. Fetch deposit address (BTC)
      const walletRes = await axios.get(`${API_URL}/user/deposit-address?asset=BTC`, { withCredentials: true });
      setWallet(walletRes.data.address);

      // 3. Fetch full ledger (Matching your backend /user/transactions/recent)
      const ledgerRes = await axios.get(`${API_URL}/user/transactions/recent`, { withCredentials: true });
      setLedger(Array.isArray(ledgerRes.data) ? ledgerRes.data : []);

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error("Node synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompound = async () => {
    try {
      const res = await axios.post(`${API_URL}/user/compound`, {}, { withCredentials: true });
      if (res.data.success) {
        toast.success("ROI successfully compounded!");
        fetchData(); // Refresh UI
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Compound failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Syncing Institutional Node...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* 1. TOP BAR: Total Valuation & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-2">
           <h1 className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Institutional Node Valuation</h1>
           <p className="text-5xl font-black text-white tracking-tighter">
             €{new Intl.NumberFormat('de-DE').format(balances.EUR || 0)}
             <span className="text-emerald-500 text-lg ml-2">.00</span>
           </p>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/dashboard/deposit')}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-4 rounded-2xl flex flex-col items-center transition-all active:scale-95"
          >
            <ArrowDownLeft size={20} />
            <span className="text-[10px] uppercase mt-1">Deposit</span>
          </button>
          <button 
            onClick={handleCompound}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl flex flex-col items-center transition-all active:scale-95"
          >
            <RefreshCcw size={20} className="text-blue-400" />
            <span className="text-[10px] uppercase mt-1">Compound</span>
          </button>
          <button 
            onClick={() => navigate('/dashboard/withdrawal')}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl flex flex-col items-center transition-all active:scale-95"
          >
            <ArrowUpRight size={20} className="text-rose-400" />
            <span className="text-[10px] uppercase mt-1">Withdraw</span>
          </button>
        </div>
      </div>

      {/* 2. Wallet Display (BTC Address Section) */}
      <WalletDisplay wallet={wallet} />

      {/* 3. Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AssetCard label="Principal" value={balances.EUR || 0} symbol="EUR" />
        <AssetCard label="Bitcoin" value={balances.BTC || 0} symbol="BTC" isCrypto />
        <AssetCard label="Tether" value={balances.USDT || 0} symbol="USDT" isCrypto />
        <AssetCard label="ROI Yield" value={balances.ROI || 0} symbol="EUR" highlight />
      </div>

      {/* 4. Recent Activity */}
      <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-black text-xs uppercase tracking-widest">Node Activity Ledger</h2>
          <button onClick={() => navigate('/dashboard/ledger')} className="text-emerald-500 text-[10px] font-bold uppercase hover:underline">View All</button>
        </div>
        <ActivityLedger transactions={ledger.slice(0, 5)} />
      </div>
    </div>
  );
}

