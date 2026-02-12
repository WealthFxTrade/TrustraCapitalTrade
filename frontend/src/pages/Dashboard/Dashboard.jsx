import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardSkeleton } from '../../components/Skeleton';
import WalletCard from './WalletCard';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import {
  TrendingUp,
  Wallet,
  ArrowDownLeft,
  Zap,
  LayoutDashboard,
  FileText,
  History,
  Repeat,
  Globe,
  User,
  Clock,
  Menu,
  X
} from 'lucide-react';

// Reusable Sidebar Component for consistent routing
const SidebarItem = ({ to, icon, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
          : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
      }`}
    >
      <span className={`${active ? 'text-white' : 'text-blue-500 group-hover:text-blue-400'}`}>
        {icon}
      </span>
      <span className="text-[11px] font-black tracking-widest uppercase">{label}</span>
    </Link>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ balance: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  const [btcPrice, setBtcPrice] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Fetch User Stats from your secure API
      const statsRes = await api.get('/user/dashboard-stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error("Stats Sync Failed:", err);
      toast.error("Failed to sync account balance");
    }
  };

  const fetchBtcPrice = async () => {
    try {
      // Using public CoinGecko API for real-time BTC/EUR
      const res = await fetch('https://api.coingecko.com');
      const data = await res.json();
      if (data?.bitcoin?.eur) setBtcPrice(data.bitcoin.eur);
    } catch (err) {
      console.warn("BTC Price feed temporarily unavailable");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), fetchBtcPrice()]);
      setLoading(false);
    };
    init();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchBtcPrice();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 bg-[#05070a] min-h-screen"><DashboardSkeleton /></div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col md:flex-row">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0a0c10] border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-blue-500 fill-current" />
          <span className="font-black italic text-sm tracking-tighter uppercase">Trustra</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR (Responsive) */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-72 bg-[#0a0c10] border-r border-white/5 flex-col p-6 space-y-8 fixed md:sticky top-0 h-full z-40`}>
        <div className="hidden md:flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Zap size={22} className="text-white fill-current" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">TrustraCapital</span>
        </div>
        
        <nav className="space-y-1">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 px-3">Main Menu</p>
          <SidebarItem to="/dashboard" icon={<LayoutDashboard size={18}/>} label="DASHBOARD" />
          <SidebarItem to="/plans" icon={<Zap size={18}/>} label="ALL SCHEMA" />
          <SidebarItem to="/investments" icon={<FileText size={18}/>} label="SCHEMA LOGS" />
          <SidebarItem to="/transactions" icon={<History size={18}/>} label="ALL TRANSACTIONS" />
          <SidebarItem to="/exchange" icon={<Repeat size={18}/>} label="WALLET EXCHANGE" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-7xl mx-auto w-full">

        {/* Top Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Network Live
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span className="text-xs font-bold text-gray-300">{user?.name?.split(' ')[0] || 'Investor'}</span>
            <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center">
              <User size={14} className="text-blue-400" />
            </div>
          </div>
        </div>

        {/* Wallet Section */}
        <section className="mb-10">
          <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">Asset Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WalletCard type="main" amount={stats?.balance || 0} />
            <WalletCard type="profit" amount={stats?.profit || 0} />
          </div>
        </section>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <Link to="/deposit" className="bg-blue-600 hover:bg-blue-500 text-white p-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 transition-all hover:-translate-y-1 active:scale-95">
            <ArrowDownLeft size={20} strokeWidth={3} /> Deposit
          </Link>
          <Link to="/plans" className="bg-white text-black hover:bg-gray-100 p-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95">
            <Zap size={20} className="fill-black" /> Invest Now
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-50" />
          <h3 className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3 mb-8">
            <Clock size={16} className="text-blue-500" /> Terminal Ledger
          </h3>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">Decrypting Node History...</span>
          </div>
        </div>

        {/* Market Pulse Footer */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Node: Trustra_Safe_v2026
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by <a href="https://www.coingecko.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">CoinGecko</a></span>
            <span className="text-white bg-blue-600/10 px-3 py-1 rounded-md border border-blue-500/20 font-mono">
              BTC/EUR: €{btcPrice ? btcPrice.toLocaleString() : 'Loading...'}
            </span>
          </div>
        </div>

      </main>
    </div>
  );
}

