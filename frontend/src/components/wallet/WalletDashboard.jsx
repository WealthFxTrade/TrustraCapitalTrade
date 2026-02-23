import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Wallet, ArrowDownCircle, ArrowUpCircle, ShieldCheck, Activity } from 'lucide-react';
import DepositTab from './DepositTab.jsx';
import WithdrawalTab from './WithdrawalTab.jsx';
import RecentActivity from './RecentActivity.jsx';
import api from '../api/api';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com';

export default function WalletDashboard() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [balances, setBalances] = useState({ BTC: 0, ETH: 0, USDT: 0, EUR: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchData = async () => {
      try {
        const [balRes, txRes] = await Promise.all([
          api.get('/wallet/balances'),
          api.get('/transactions/recent?limit=10')
        ]);
        setBalances(balRes.data.balances || balances);
        setTransactions(txRes.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // WebSocket logic
    const socket = io(SOCKET_URL, { auth: { token } });
    socket.on('balanceUpdate', setBalances);
    socket.on('transactionUpdate', (tx) => setTransactions(prev => [tx, ...prev]));

    return () => socket.disconnect();
  }, []);

  const formatBalance = (ticker) => {
    const val = balances[ticker] || 0;
    return ticker === 'EUR' || ticker === 'USDT' 
      ? val.toLocaleString(undefined, { minimumFractionDigits: 2 }) 
      : val.toLocaleString(undefined, { minimumFractionDigits: 6 });
  };

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      {/* Header Info */}
      <div className="p-6 border-b border-slate-800 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2">
            <Wallet size={16} className="text-blue-500" /> Capital Terminals
          </h3>
          <p className="text-slate-500 text-[9px] font-bold uppercase mt-1">Live Ledger Synchronization</p>
        </div>
        <div className="flex gap-4">
           {['EUR', 'BTC'].map(ticker => (
             <div key={ticker} className="text-right">
                <p className="text-slate-500 text-[8px] font-black uppercase">{ticker}</p>
                <p className="text-sm font-bold text-white font-mono">{formatBalance(ticker)}</p>
             </div>
           ))}
        </div>
      </div>

      {/* Action Tabs */}
      <div className="p-6">
        <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-800 mb-6">
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'deposit' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <ArrowDownCircle size={14} /> Deposit
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'withdraw' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <ArrowUpCircle size={14} /> Withdraw
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="min-h-[300px] transition-all duration-500">
          {activeTab === 'deposit' ? <DepositTab /> : <WithdrawalTab />}
        </div>
      </div>

      {/* Footer Transactions */}
      <div className="p-6 bg-slate-950/30 border-t border-slate-800">
         <RecentActivity transactions={transactions} loading={loading} />
      </div>
    </div>
  );
}

