import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardSkeleton } from '../../components/Skeleton';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom'; // Added for navigation
import {
  TrendingUp, Wallet, ArrowUpRight, ArrowDownRight,
  BarChart3, Clock, ShieldCheck, Zap, X, LayoutDashboard, 
  FileText, History, Repeat, ChevronRight
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
      console.error("Sync Failed:", err);
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
      <aside className="w-full md:w-64 bg-[#0a0c10] border-r border-white/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black">T</div>
          <span className="font-black tracking-tighter text-xl italic">TRUSTRA</span>
        </div>

        <nav className="flex flex-col gap-2">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 px-2">Menu</p>
          <NavItem to="/dashboard" icon={<LayoutDashboard size={18}/>} label="DASHBOARD" active />
          <NavItem to="/plans" icon={<Zap size={18}/>} label="ALL SCHEMA" />
          <NavItem to="/investments" icon={<FileText size={18}/>} label="SCHEMA LOGS" />
          <NavItem to="/transactions" icon={<History size={18}/>} label="ALL TRANSACTIONS" />
          <NavItem to="/exchange" icon={<Repeat size={18}/>} label="WALLET EXCHANGE" />
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* Header with Language/User */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-sm font-bold text-gray-400 italic uppercase">Account Overview</h2>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
             <span>ENGLISH</span>
             <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
               {user?.name?.[0]}
             </div>
          </div>
        </div>

        {/* --- ACCOUNT BALANCES (The "Wallet" Look) --- */}
        <section className="mb-10">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">Account Balance</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Main Wallet */}
            <div className="bg-[#0f1218] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group hover:border-blue-500/30 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wallet size={80} />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Main Wallet</p>
              <h3 className="text-4xl font-black tracking-tighter">
                €{stats?.balance?.toLocaleString() || '0'}
              </h3>
            </div>

            {/* Profit Wallet */}
            <div className="bg-[#0f1218] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
                <TrendingUp size={80} />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Profit Wallet</p>
              <h3 className="text-4xl font-black tracking-tighter text-emerald-400">
                €{stats?.profit?.toLocaleString() || '0'}
              </h3>
            </div>
          </div>
        </section>

        {/* --- QUICK ACTION BUTTONS --- */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link to="/deposit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 transition-transform active:scale-95">
            <ArrowDownRight size={18} /> Deposit Funds
          </Link>
          <Link to="/plans" className="flex-1 bg-white text-black hover:bg-gray-200 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-transform active:scale-95">
            <Zap size={18} /> Invest Now
          </Link>
        </div>

        {/* Live BTC Price Footer */}
        <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Network Live</span>
           </div>
           <span className="font-mono text-xs text-blue-400 font-bold tracking-tighter">
             BTC: €{btcPrice?.toLocaleString() || '---'}
           </span>
        </div>
      </main>
    </div>
  );
}

// Helper Component for Sidebar
function NavItem({ to, icon, label, active = false }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
        active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <ChevronRight size={14} className={active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
    </Link>
  );
}

