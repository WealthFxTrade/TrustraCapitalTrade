import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WalletCard from './WalletCard';
import { DashboardSkeleton } from '../../components/Skeleton';
import { LayoutDashboard, Zap, FileText, History, User, Menu, X, ArrowDownLeft } from 'lucide-react';

const SidebarItem = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
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
  const [btcPrice, setBtcPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch dashboard stats
      const statsRes = await fetch('/api/user/dashboard-stats');
      const statsData = await statsRes.json();
      setStats(statsData || { balance: 0, profit: 0 });

      // Fetch BTC price in EUR
      const btcRes = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur'
      );
      if (btcRes.ok) {
        const btcData = await btcRes.json();
        if (btcData?.bitcoin?.eur) setBtcPrice(btcData.bitcoin.eur);
      }
    } catch (err) {
      console.error('Dashboard Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 bg-[#05070a] min-h-screen"><DashboardSkeleton /></div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col md:flex-row">
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-5 bg-[#0a0c10] border-b border-white/5 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-blue-500 fill-current" />
          <span className="font-black italic text-sm tracking-tighter uppercase">Trustra</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white/5 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 fixed md:sticky top-0 left-0 w-full md:w-72
          bg-[#0a0c10] border-r border-white/5 flex flex-col p-6 space-y-8
          h-screen z-40 transition-transform duration-300`}
      >
        <div className="hidden md:flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Zap size={22} className="text-white fill-current" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">TrustraCapital</span>
        </div>

        <nav className="space-y-1">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 px-3">Main Menu</p>
          <SidebarItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="DASHBOARD" onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/plans" icon={<Zap size={18} />} label="ALL SCHEMA" onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/investments" icon={<FileText size={18} />} label="SCHEMA LOGS" onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/transactions" icon={<History size={18} />} label="ALL TRANSACTIONS" onClick={() => setIsMobileMenuOpen(false)} />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Network Live
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
            <span className="text-xs font-bold text-gray-300">{user?.name?.split(' ')[0] || 'Investor'}</span>
            <User size={14} className="text-blue-400" />
          </div>
        </div>

        {/* Asset Overview */}
        <section className="mb-10">
          <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">Asset Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WalletCard type="main" amount={stats?.balance} />
            <WalletCard type="profit" amount={stats?.profit} />
          </div>
        </section>

        {/* BTC Price */}
        <section className="mb-12">
          <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2">Live BTC Price (EUR)</h2>
          <div className="text-5xl md:text-7xl font-bold text-cyan-400 tracking-tight">
            {btcPrice ? `€${btcPrice.toLocaleString()}` : '---'}
          </div>
        </section>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <Link to="/deposit" className="bg-blue-600 hover:bg-blue-500 p-6 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-transform active:scale-95">
            <ArrowDownLeft size={20} /> Deposit
          </Link>
          <Link to="/plans" className="bg-white text-black hover:bg-gray-100 p-6 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-transform active:scale-95">
            <Zap size={20} /> Invest Now
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-600">
          <span>Trustra_Node_v8.4.1</span>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">BTC/EUR:</span>
            <span className="text-white">{btcPrice ? `€${btcPrice.toLocaleString()}` : '---'}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
