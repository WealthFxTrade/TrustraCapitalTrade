import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from "react";
import api from "../../api/api";
import { API_ENDPOINTS } from "../../constants/api";
import { useAuth } from "../../context/AuthContext";

// Sub-components
import PortfolioValue from "../../components/dashboard/PortfolioValue";
import TradingChart from "../../components/dashboard/TradingChart";
import ActivityLedger from "../../components/dashboard/ActivityLedger";
import AssetCard from "../../components/dashboard/AssetCard";

// Icons
import {
  RefreshCcw,
  Loader2,
  Wallet,
  Coins,
  Activity,
  Zap,
  TrendingUp,
  X,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState({ BTC: 0, ETH: 0, EUR: 0, ROI: 0 });
  const [prices, setPrices] = useState({ BTC: 0, ETH: 0 });
  const [ledger, setLedger] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showCompoundModal, setShowCompoundModal] = useState(false);
  const [isCompounding, setIsCompounding] = useState(false);

  /* ── MARKET PRICE FETCH ── */
  const fetchMarketPrices = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=eur"
      );
      const data = await res.json();
      setPrices({
        BTC: data.bitcoin.eur,
        ETH: data.ethereum.eur
      });
    } catch (err) {
      console.error("Price fetch error:", err);
    }
  };

  /* ── DASHBOARD DATA FETCH ── */
  const fetchDashboardData = useCallback(async () => {
    try {
      const [balanceRes, ledgerRes, chartRes] = await Promise.all([
        api.get(API_ENDPOINTS.USER.PROFILE), // Sync with your userRoutes.js
        api.get(API_ENDPOINTS.USER.LEDGER),
        api.get("https://coingecko.com")
      ]);

      if (balanceRes.data.success) {
        setBalances(balanceRes.data.user.balances);
      }

      if (ledgerRes.data.success) {
        setLedger(ledgerRes.data.data.slice(0, 15));
      }

      if (chartRes.data.prices) {
        const formatted = chartRes.data.prices.map((item) => ({
          time: new Date(item[0]).toLocaleDateString(),
          value: item[1]
        }));
        setChartData(formatted);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── PORTFOLIO VALUE ENGINE ── */
  const portfolioValue = useMemo(() => {
    const btcValue = balances.BTC * prices.BTC;
    const ethValue = balances.ETH * prices.ETH;
    const eurValue = balances.EUR;
    const roiValue = balances.ROI;
    return btcValue + ethValue + eurValue + roiValue;
  }, [balances, prices]);

  /* ── ROI PERCENT CALCULATION ── */
  const roiPercent = useMemo(() => {
    const invested = balances.INVESTED || balances.EUR || 1; 
    return ((balances.ROI / invested) * 100).toFixed(2);
  }, [balances]);

  /* ── REFRESH DASHBOARD ── */
  const refreshDashboard = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchMarketPrices()]);
    setIsRefreshing(false);
  };

  /* ── COMPOUND ROI ── */
  const handleCompound = async () => {
    if (balances.ROI < 10) return alert("Minimum €10 required to compound.");
    setIsCompounding(true);
    try {
      const res = await api.post(API_ENDPOINTS.USER.COMPOUND);
      if (res.data.success) {
        await refreshDashboard();
        setShowCompoundModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Compound failed.");
    } finally {
      setIsCompounding(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchMarketPrices();
    const interval = setInterval(refreshDashboard, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-10 bg-[#050505] min-h-screen text-white font-sans">
      {/* HEADER */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Terminal: {user?.username}
          </h1>
          <p className="text-white/40 text-[10px] font-mono tracking-[0.3em] uppercase mt-2">
            Zurich Mainnet // Secure Tunnel Active
          </p>
        </div>

        <button
          onClick={refreshDashboard}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
        >
          <RefreshCcw size={14} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Syncing..." : "Sync Node"}
        </button>
      </header>

      {/* PORTFOLIO VALUE */}
      <PortfolioValue value={portfolioValue} />

      {/* ASSET CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AssetCard
          label="Bitcoin"
          value={balances.BTC}
          price={prices.BTC}
          icon={<Coins size={20} className="text-orange-500" />}
          symbol="BTC"
        />
        <AssetCard
          label="Ethereum"
          value={balances.ETH}
          price={prices.ETH}
          icon={<Activity size={20} className="text-indigo-500" />}
          symbol="ETH"
        />
        <AssetCard
          label="Euro Balance"
          value={balances.EUR}
          price={1}
          icon={<Wallet size={20} className="text-blue-500" />}
          symbol="EUR"
        />

        {/* ROI CARD */}
        <div
          className="bg-yellow-500 text-black p-6 rounded-[2rem] cursor-pointer hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/10 flex flex-col justify-between group"
          onClick={() => setShowCompoundModal(true)}
        >
          <div className="flex justify-between items-start">
            <p className="uppercase text-[10px] font-black tracking-widest opacity-60">Accrued ROI</p>
            <Zap size={20} fill="black" />
          </div>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter">€{balances.ROI.toFixed(2)}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">+{roiPercent}% Protocol Yield</p>
          </div>
        </div>
      </section>

      {/* MARKET + CHART */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Market Performance</h3>
            <ShieldCheck size={16} className="text-green-500" />
          </div>
          <TradingChart data={chartData} />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
          <h3 className="mb-8 text-xs font-black uppercase tracking-widest text-white/40">Live Index</h3>
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">BTC / EUR</span>
              <span className="text-lg font-black italic tracking-tighter">€{prices.BTC.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ETH / EUR</span>
              <span className="text-lg font-black italic tracking-tighter">€{prices.ETH.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Network Fee</span>
              <span className="text-xs font-bold text-green-500">0.00%</span>
            </div>
          </div>
        </div>
      </section>

      {/* LEDGER */}
      <section className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
        <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40 italic">Activity Ledger</h3>
          <ArrowRight size={16} className="text-white/20" />
        </div>
        <ActivityLedger transactions={ledger} />
      </section>

      {/* COMPOUND MODAL */}
      {showCompoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-[3rem] p-12 relative text-center">
            <button onClick={() => setShowCompoundModal(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8 text-black shadow-xl shadow-white/10">
              <Zap size={32} fill="black" />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Protocol Compound</h2>
            <p className="text-white/40 text-[10px] font-black tracking-widest uppercase mb-10 leading-relaxed px-4">
              Synchronizing €{balances.ROI.toFixed(2)} from Yield to Staking Balance
            </p>
            <button
              onClick={handleCompound}
              disabled={isCompounding}
              className="w-full bg-white text-black py-5 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase hover:bg-yellow-500 transition-all shadow-xl shadow-white/5"
            >
              {isCompounding ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Authorize Sync"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

