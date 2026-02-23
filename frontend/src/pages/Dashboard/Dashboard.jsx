import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { useBtcPrice } from '../../hooks/useBtcPrice';
import { useSocket } from '../../hooks/useSocket';
import api from '../../api/api';
import toast from 'react-hot-toast';

// Components
import DashboardHeader from '../../components/DashboardHeader';
import AccountSummary from '../../components/AccountSummary';
import StatCard from '../../components/StatCard';
import CopyButton from '../../components/CopyButton';

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────

const MARKET_POLL_INTERVAL = 60_000;

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

/**
 * Safely format a number as EUR currency string.
 */
function formatEur(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Safely format a BTC amount to 8 decimal places.
 */
function formatBtc(value) {
  const num = Number(value) || 0;
  return `${num.toFixed(8)} BTC`;
}

// ──────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────

export default function Dashboard() {
  const { user, token } = useAuth();
  const { stats, fetchStats, loading, error: statsError } = useUser();
  const btcPrice = useBtcPrice(MARKET_POLL_INTERVAL);

  const userId = user?.id || user?._id;

  // ── Real-Time Socket ──────────────────────
  const handleProfitUpdate = useCallback(
    (data) => {
      toast.success(data?.message || 'Profit credited', { duration: 6000 });
      fetchStats?.();
    },
    [fetchStats]
  );

  const handleBalanceUpdate = useCallback(
    () => {
      toast.success('BTC deposit confirmed');
      fetchStats?.();
    },
    [fetchStats]
  );

  useSocket({
    userId,
    token,
    events: {
      profit_update: handleProfitUpdate,
      balance_update: handleBalanceUpdate
    }
  });

  // ── Computed Display Stats ────────────────
  const displayStats = useMemo(() => {
    const balances = stats?.balances || user?.balances || {};

    const mainBalance = Number(balances.EUR) || 0;
    const profit = Number(balances.EUR_PROFIT) || 0;
    const btc = Number(balances.BTC) || 0;
    const investedAmount = Number(stats?.investedAmount || user?.investedAmount) || 0;
    const dailyRoiRate = Number(stats?.dailyRoiRate || user?.dailyRoiRate) || 0;
    const isPlanActive = stats?.isPlanActive || user?.isPlanActive || false;

    return {
      mainBalance,
      profit,
      btc,
      activeNodes: isPlanActive ? 1 : 0,
      dailyROI: investedAmount * dailyRoiRate
    };
  }, [stats, user]);

  const btcAddress = stats?.btcAddress || user?.btcAddress;

  // ── Loading State ─────────────────────────
  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div
          className="w-10 h-10 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"
          role="status"
          aria-label="Loading dashboard"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans">
      <DashboardHeader btcPrice={btcPrice} />

      <main className="px-6 lg:px-20 py-12 space-y-8 max-w-7xl mx-auto">
        {/* Error Banner */}
        {statsError && (
          <div
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center text-red-400 text-sm"
            role="alert"
          >
            Failed to load account data.{' '}
            <button
              onClick={fetchStats}
              className="underline hover:text-red-300 font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Account Summary */}
        <section>
          <AccountSummary user={user} stats={displayStats} />
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Equity" value={formatEur(displayStats.mainBalance)} />
          <StatCard
            title="Yield Profit"
            value={formatEur(displayStats.profit)}
            highlight
          />
          <StatCard title="BTC Wallet" value={formatBtc(displayStats.btc)} />
          <StatCard title="Est. Daily ROI" value={formatEur(displayStats.dailyROI)} />
        </section>

        {/* BTC Deposit Address */}
        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-4">
            Your Deposit Address
          </p>
          {btcAddress ? (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <code className="text-yellow-500 font-mono text-sm md:text-lg break-all bg-black/40 px-4 py-2 rounded-lg border border-white/5">
                {btcAddress}
              </code>
              <CopyButton text={btcAddress} />
            </div>
          ) : (
            <p className="text-slate-600 text-sm animate-pulse">
              Generating address...
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
