import React, { useEffect, useState, useCallback, useRef } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCharts from '../components/DashboardCharts';
import RecentTransactions from '../components/RecentTransactions';
import {
  getUserBalance,
  getBtcPrice,
  getInvestmentPlans,
  getTransactions,
} from '../api';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage({ user, logout }) {
  const [data, setData] = useState({
    balance: 0,
    plan: 'Basic',
    dailyRate: 0,
    btcPrice: 73000,
    btcHistory: Array(15).fill(73000),
    plans: [],
    transactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const latestDataRef = useRef(data);
  useEffect(() => { latestDataRef.current = data; }, [data]);

  // --- Fetch Core Data ---
  const fetchDashboardData = useCallback(async () => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      setFetchError(null);

      const [userRes, btcRes, plansRes, txRes] = await Promise.all([
        getUserBalance({ signal }),
        getBtcPrice({ signal }),
        getInvestmentPlans({ signal }),
        getTransactions({ signal }),
      ]);

      const btcPrice = Number(btcRes?.price ?? latestDataRef.current.btcPrice);

      setData((prev) => ({
        ...prev,
        balance: userRes?.balance ?? prev.balance,
        plan: userRes?.plan ?? prev.plan,
        dailyRate: userRes?.dailyRate ?? prev.dailyRate,
        btcPrice,
        plans: Array.isArray(plansRes) ? plansRes : prev.plans,
        transactions: Array.isArray(txRes) ? txRes : (txRes?.transactions || prev.transactions),
        btcHistory: [...prev.btcHistory, btcPrice].slice(-60),
      }));
    } catch (err) {
      if (err.name === 'AbortError') return;
      const msg = err.response?.data?.message || err.message || 'Failed to sync with secure servers';
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setHasLoadedOnce(true);
    }

    return controller;
  }, []);

  // --- Initial Fetch + Polling Fallback ---
  useEffect(() => {
    let controller;
    const run = async () => { controller = await fetchDashboardData(); };
    run();

    const refreshInterval = setInterval(run, 30000); // 30s fallback
    return () => { controller?.abort(); clearInterval(refreshInterval); };
  }, [fetchDashboardData]);

  // --- Real-time WebSocket for BTC Price & Transactions ---
  useEffect(() => {
    const ws = new WebSocket('wss://trustracapitaltrade-backend.onrender.com/ws');

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // BTC Price update
        if (msg.type === 'btc_price') {
          setData(prev => ({
            ...prev,
            btcPrice: msg.price,
            btcHistory: [...prev.btcHistory, msg.price].slice(-60)
          }));
        }

        // New transaction
        if (msg.type === 'transaction') {
          setData(prev => ({
            ...prev,
            transactions: [msg.transaction, ...prev.transactions].slice(0, 50) // keep 50 latest
          }));
        }

        // Optional: balance update
        if (msg.type === 'balance') {
          setData(prev => ({ ...prev, balance: msg.balance }));
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    ws.onclose = () => console.log('WebSocket closed');
    ws.onerror = (e) => console.error('WebSocket error', e);

    return () => ws.close();
  }, []);

  const handleRetry = () => { setLoading(true); fetchDashboardData(); };

  if (loading && !hasLoadedOnce) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin h-16 w-16 border-t-4 border-indigo-500 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      <DashboardHeader
        user={user}
        balance={data.balance ?? 0}
        plan={data.plan || 'Basic'}
        logout={logout}
      />

      {fetchError && (
        <div className="max-w-7xl mx-auto px-4 pt-5">
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <span className="text-sm font-medium">{fetchError}</span>
            </div>
            <button onClick={handleRetry} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all active:scale-95 text-xs uppercase tracking-widest">
              Retry Sync
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {data.btcHistory.length < 2 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-12 text-center text-slate-500">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 w-10 bg-slate-800 rounded-full mb-4" />
              <p>Analyzing market trends...</p>
            </div>
          </div>
        ) : (
          <DashboardCharts btcHistory={data.btcHistory} btcPrice={data.btcPrice} plans={data.plans} />
        )}

        <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-1 overflow-hidden">
          <RecentTransactions transactions={data.transactions} isLoading={loading} />
        </div>
      </main>
    </div>
  );
}
