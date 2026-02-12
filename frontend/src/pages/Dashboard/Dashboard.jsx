import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Ensure react-router-dom is used
import { useAuth } from '../../context/AuthContext';
import { DashboardSkeleton } from '../../components/Skeleton';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import {
  TrendingUp, Wallet, ArrowDownLeft, Zap, 
  LayoutDashboard, FileText, History, Repeat, 
  ChevronRight, Globe, User, Clock
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btcPrice, setBtcPrice] = useState(null);

  const fetchAllData = async () => {
    try {
      const [statsRes, btcRes] = await Promise.all([
        api.get('/user/dashboard-stats'),
        fetch('https://api.coingecko.com')
      ]);
      const btcData = await btcRes.json();
      setStats(statsRes.data);
      if (btcData?.bitcoin?.eur) setBtcPrice(btcData.bitcoin.eur);
    } catch (err) {
      console.error("Terminal Sync Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 bg-[#05070a] min-h-screen"><DashboardSkeleton /></div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col md:flex-row">
      
      {/* --- LEFT SIDEBAR NAVIGATION --- */}
      <aside className="w-full md:w-72 bg-[#0a0c10] border-r border-white/5 flex flex-col p-6 space-y-8">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Zap size={22} className="text-white fill-current" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">TrustraCapital</span>
        </div>

        <nav className="space-y-1">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 px-3">Main Menu</p>
          <SidebarItem to="/dashboard" icon={<LayoutDashboard size={18}/>} label="DASHBOARD" active />
          <SidebarItem to="/plans" icon={<Zap size={18}/>} label="ALL SCHEMA" />
          <SidebarItem to="/investments" icon={<FileText size={18}/>} label="SCHEMA LOGS" />
          <SidebarItem to="/transactions" icon={<History size={18}/>} label="ALL TRANSACTIONS" />
          <SidebarItem to="/exchange" icon={<Repeat size={18}/>} label="WALLET EXCHANGE" />
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Network Live
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
              <Globe size={14} /> ENGLISH
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className="text-xs font-bold text-gray-300">{user?.name?.split(' ')[0] || 'Investor'}</span>
              <User size={16} className="text-blue-400" />
            </div>
          </div>
        </div>

        {/* --- WALLET SECTION --- */}
        <section className="mb-10">
          <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">Account Balance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Main Wallet */}
            <div className="bg-[#0f1218] border border-white/5 rounded-[2rem] p-8 relative group hover:border-blue-500/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Main Wallet</p>
                <Wallet size={24} className="text-gray-700 group-hover:text-blue-500" />
              </div>
              <h3 className="text-5xl font-black tracking-tighter">
                €{stats?.balance?.toLocaleString() || '0.00'}
              </h3>
            </div>

            {/* Profit Wallet */}
            <div className="bg-[#0f1218] border border-white/5 rounded-[2rem] p-8 relative group hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Profit Wallet</p>
                <TrendingUp size={24} className="text-gray-700 group-hover:text-emerald-500" />
              </div>
              <h3 className="text-5xl font-black tracking-tighter text-emerald-400">
                €{stats?.profit?.toLocaleString() || '0.00'}
              </h3>
            </div>
          </div>
        </section>

        {/* --- QUICK ACTION BUTTONS --- */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link to="/deposit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 transition active:scale-95">
            <ArrowDownLeft size={20} /> Deposit
          </Link>
          <Link to="/plans" className="flex-1 bg-white text-black hover:bg-gray-100 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition active:scale-95">
            <Zap size={20} className="fill-black" /> Invest Now
          </Link>
        </div>

        {/* --- RECENT ACTIVITY LOG --- */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
          <h3 className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3 mb-8">
            <Clock size={16} className="text-blue-500" /> Terminal Ledger
          </h3>
          <div className="text-center py-10 opacity-30 italic text-xs uppercase tracking-widest font-black">
             Syncing real-time transactions...
          </div>
        </div>

        {/* BTC Price Footer */}
        <div className="mt-12 pt-6 border-t border-white/5 flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
           <span>Node: Trustra_Safe_v4</span>
           <span className="text-blue-400 font-mono">BTC/EUR: €{btcPrice?.toLocaleString() || '---'}</span>
        </div>
      </main>
    </div>
  );
}

// Sidebar Link Component
function SidebarItem({ to, icon, label, active = false }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${
        active 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' 
        : 'text-gray-500 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <ChevronRight size={14} className={`${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
    </Link>
  );
}

