// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingUp,
  Wallet,
  Activity,
  RefreshCw,
  ArrowUpRight,
  Loader2,
  MessageSquare,
  LifeBuoy,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '@/api/api';
import VaultSection from '@/pages/Dashboard/VaultSection';

// ── Live Bitcoin Price ──
const LiveBitcoinPrice = () => {
  const [price, setPrice] = useState(null);
  const [change24h, setChange24h] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrice = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      setError(null);
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur&include_24hr_change=true',
        { signal: controller.signal }
      );

      if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

      const data = await res.json();
      const btc = data.bitcoin;

      if (!btc?.eur) throw new Error('Invalid response');

      setPrice(btc.eur.toLocaleString('en-US', { style: 'currency', currency: 'EUR' }));
      setChange24h(btc.eur_24h_change.toFixed(2));
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('BTC price fetch failed:', err);
        setError('Price unavailable');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 90000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  if (loading) return <div className="text-gray-400 animate-pulse">Loading BTC...</div>;
  if (error) return <div className="text-red-400 text-sm">{error}</div>;

  const isPositive = Number(change24h) >= 0;

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-5 py-3 text-sm backdrop-blur-sm">
      <span className="text-gray-400 mr-2">BTC/EUR:</span>
      <span className="font-bold">{price || '—'}</span>
      <span className={`ml-2 font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{change24h || '—'}%
      </span>
    </div>
  );
};

// ── Stat Card ──
const StatCard = ({ label, value, icon: Icon, color = 'text-white', prefix = '€', suffix = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="p-6 md:p-8 rounded-3xl bg-gray-900/70 border border-gray-800 hover:border-gray-600 transition-all backdrop-blur-md shadow-lg"
  >
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <Icon size={24} className={`${color} opacity-90`} />
    </div>
    <div className="text-3xl md:text-4xl font-extrabold">
      {prefix}
      <CountUp end={Number(value) || 0} decimals={2} separator="," duration={1.8} />
      {suffix}
    </div>
  </motion.div>
);

// ── Dashboard ──
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState({
    totalValue: 0,
    pnl: 0,
    pnlPercent: 0,
    assets: [],
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, historyRes, supportRes] = await Promise.all([
        api.get('/user/profile').catch(() => ({ data: { user: {} } })),
        api.get('/user/portfolio-history').catch(() => ({ data: { history: [] } })),
        api.get('/support/tickets').catch(() => ({ data: { unread: 0 } })),
      ]);

      const userData = profileRes.data.user || {};

      // ── Use correct field names from your User model ──
      setPortfolio({
        totalValue: userData.totalBalance ?? 0,
        pnl: userData.totalProfit ?? 0,
        pnlPercent: userData.pnlPercent ?? 0,
        assets: userData.assets ?? [],
      });

      // Chart data
      if (historyRes.data.history?.length > 0) {
        setChartData(
          historyRes.data.history.map((item) => ({
            date: item.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: item.value || 0,
          }))
        );
      } else {
        setChartData([]);
      }

      setUnreadMessages(supportRes.data.unread > 0);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load dashboard';
      setError(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Socket.io real-time updates
  useEffect(() => {
    if (!user?._id) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
    const socket = io(socketUrl, {
      auth: { userId: user._id },
      reconnection: true,
      reconnectionAttempts: 5,
      withCredentials: true,
    });

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('portfolioUpdate', (update) => {
      setPortfolio((prev) => ({
        ...prev,
        totalValue: update.totalValue ?? prev.totalValue,
        pnl: update.pnl ?? prev.pnl,
        pnlPercent: update.pnlPercent ?? prev.pnlPercent,
      }));
      toast('Portfolio updated', { icon: '📊', duration: 3000 });
    });
    socket.on('connect_error', (err) => console.warn('Socket error:', err.message));

    return () => socket.disconnect();
  }, [user?._id]);

  // Initial fetch + periodic
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
    } catch {
      toast.error('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center flex-col gap-8">
        <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
        <p className="text-xl text-gray-300">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center flex-col gap-6 text-center px-4">
        <div className="text-red-400 text-2xl">Error</div>
        <p className="text-gray-300 text-lg">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 lg:p-12">
      {/* Disclaimer */}
      <div className="bg-gradient-to-r from-emerald-950/70 to-emerald-900/40 border border-emerald-800/50 text-emerald-200 p-5 rounded-2xl mb-10 text-center text-base shadow-lg">
        <strong>Intelligent Capital Growth Engine:</strong> Our automated trading system actively manages your investment to minimize downside risk 📉 while capturing upside opportunities. Only invest what you can afford to lose — let the algorithm work for you.
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Welcome back, {user?.username || 'Investor'} • {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
          <LiveBitcoinPrice />
          {unreadMessages && (
            <motion.button
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/support')}
              className="flex items-center gap-3 bg-yellow-600/30 hover:bg-yellow-600/50 px-5 py-3 rounded-xl text-yellow-300 border border-yellow-600/40 transition-all"
            >
              <MessageSquare size={20} />
              <span>New Message</span>
            </motion.button>
          )}
          <button
            onClick={fetchDashboardData}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw size={22} />
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10">
        <StatCard
          label="Total Portfolio Value"
          value={portfolio.totalValue}
          icon={Wallet}
          color="text-blue-400"
        />
        <StatCard
          label="Profit & Loss"
          value={Math.abs(portfolio.pnl)}
          prefix={portfolio.pnl >= 0 ? '+' : '-'}
          icon={TrendingUp}
          color={portfolio.pnl >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="PnL Percentage"
          value={Math.abs(portfolio.pnlPercent)}
          suffix="%"
          prefix={portfolio.pnlPercent >= 0 ? '+' : '-'}
          icon={Activity}
          color={portfolio.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}
        />
      </div>

      {/* Portfolio Chart */}
      <section className="bg-gray-900/70 border border-gray-800 p-6 md:p-10 rounded-3xl mb-10 backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold">Portfolio Performance</h2>
          <span className="text-gray-400 text-sm md:text-base">Last 30 days</span>
        </div>

        <div className="h-80 md:h-96">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-lg font-medium">
              No portfolio activity yet. Make your first deposit to see performance.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#f3f4f6',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#areaGradient)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Vault Section */}
      <VaultSection />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/trade')}
          className="bg-gradient-to-br from-blue-900 to-indigo-900 p-8 md:p-10 rounded-3xl flex items-center justify-between group cursor-pointer border border-blue-800/50 hover:border-blue-600 transition-all shadow-lg"
        >
          <div className="flex items-center gap-6">
            <div className="bg-blue-500/20 p-6 rounded-2xl">
              <TrendingUp size={36} className="text-blue-300" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Trade Markets</h3>
              <p className="text-gray-300">Spot, futures & margin trading</p>
            </div>
          </div>
          <ArrowUpRight size={32} className="text-blue-300 opacity-70 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/support')}
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 md:p-10 rounded-3xl flex items-center justify-between group cursor-pointer border border-gray-700 hover:border-gray-500 transition-all shadow-lg"
        >
          <div className="flex items-center gap-6">
            <div className="bg-gray-600/30 p-6 rounded-2xl">
              <LifeBuoy size={36} className="text-gray-300" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Support Center</h3>
              <p className="text-gray-300">24/7 assistance & ticket system</p>
            </div>
          </div>
          <ChevronRight size={32} className="text-gray-300 opacity-70 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
        </motion.button>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-10 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p className="mb-6">
          Cryptocurrency trading involves substantial risk and is not suitable for everyone. Always do your own research.
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 mx-auto px-6 py-3 bg-red-900/40 hover:bg-red-900/60 border border-red-800 rounded-xl text-red-300 transition-all"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </footer>
    </div>
  );
}
