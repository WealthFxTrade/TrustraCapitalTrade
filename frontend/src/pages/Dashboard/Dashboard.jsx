import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { useBtcPrice } from '../../hooks/useBtcPrice';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';

// Components
import DashboardHeader from '../../components/DashboardHeader';
import AccountSummary from '../../components/AccountSummary';
import StatCard from '../../components/StatCard';
import CopyButton from '../../components/CopyButton';

const MARKET_POLL_INTERVAL = 60_000;

// Helper: Standardized Currency Formatting for 2026
const formatEur = (val) => new Intl.NumberFormat('en-IE', { 
  style: 'currency', currency: 'EUR' 
}).format(Number(val) || 0);

const formatBtc = (val) => `${(Number(val) || 0).toFixed(8)} BTC`;

export default function Dashboard() {
  const { user, token } = useAuth();
  // ⚡ FIX: Added fetchStats to dependencies for the socket handlers
  const { stats, fetchStats, loading, error: statsError } = useUser();
  const btcPrice = useBtcPrice(MARKET_POLL_INTERVAL);

  const userId = user?.id || user?._id;

  // ── Real-Time Socket Handlers ──
  const handleProfitUpdate = useCallback((data) => {
    toast.success(data?.message || 'Yield Profit Credited', { icon: '💰' });
    if (fetchStats) fetchStats(); // Refresh data immediately
  }, [fetchStats]);

  const handleBalanceUpdate = useCallback(() => {
    toast.success('Blockchain Confirmation: BTC Received', { icon: '✅' });
    if (fetchStats) fetchStats();
  }, [fetchStats]);

  // Connect Socket
  useSocket({
    userId,
    token,
    events: {
      profit_update: handleProfitUpdate,
      balance_update: handleBalanceUpdate
    }
  });

  // ── Computed Stats (Fixing Object Nesting) ──
  const displayStats = useMemo(() => {
    // Check both local state (user) and server-sync state (stats)
    const source = stats || user || {};
    const balances = source.balances || {};

    return {
      mainBalance: Number(balances.EUR || 0),
      profit: Number(balances.EUR_PROFIT || 0),
      btc: Number(balances.BTC || 0),
      investedAmount: Number(source.investedAmount || 0),
      dailyROI: (Number(source.investedAmount || 0) * Number(source.dailyRoiRate || 0)),
      btcAddress: source.btcAddress || "Address Generating..."
    };
  }, [stats, user]);

  // ── Loading Gate ──
  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300">
      <DashboardHeader btcPrice={btcPrice} />

      <main className="px-6 lg:px-20 py-12 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Error Fallback */}
        {statsError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex justify-between items-center">
            <p className="text-red-400 text-xs font-black uppercase tracking-widest">Data Synchronization Failed</p>
            <button onClick={fetchStats} className="text-[10px] font-black uppercase bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all">Retry Link</button>
          </div>
        )}

        {/* Top Summary Section */}
        <section>
          <AccountSummary user={user} stats={displayStats} />
        </section>

        {/* 4-Column Stat Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Capital Equity" value={formatEur(displayStats.mainBalance)} />
          <StatCard title="Yield Profit" value={formatEur(displayStats.profit)} highlight />
          <StatCard title="BTC Assets" value={formatBtc(displayStats.btc)} />
          <StatCard title="Est. Daily ROI" value={formatEur(displayStats.dailyROI)} />
        </section>

        {/* Deposit Interface */}
        <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] text-center backdrop-blur-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6 italic">Secure Node Deposit Address</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="bg-black/60 border border-white/5 px-6 py-4 rounded-2xl">
              <code className="text-yellow-500 font-mono text-xs md:text-sm break-all tracking-tight">
                {displayStats.btcAddress}
              </code>
            </div>
            <CopyButton text={displayStats.btcAddress} />
          </div>
          <p className="mt-6 text-[9px] font-bold text-slate-700 uppercase tracking-widest">
            Send only BTC to this address. Network confirmations take 10-30 minutes.
          </p>
        </div>
      </main>
    </div>
  );
}

