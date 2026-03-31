import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ArrowUpRight, History, LogOut, ShieldCheck,
  Loader2, RefreshCw, ArrowDownLeft, TrendingUp, Zap, Menu, X
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

// ── SIDEBAR LINK COMPONENT ──
function SidebarLink({ icon: Icon, label, active = false, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all w-full text-left group ${
        active 
          ? 'bg-emerald-600 text-black shadow-lg shadow-emerald-600/20' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={18} className={active ? 'text-black' : 'group-hover:text-emerald-500 transition-colors'} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

export default function Dashboard() {
  const { user, logout, initialized, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [balances, setBalances] = useState({ EUR: 0, ROI: 0, INVESTED: 0, BTC: 0, USDT: 0 });
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ── 📡 REAL-TIME ENGINE (SOCKET.IO) ──
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const socket = io(import.meta.env.VITE_API_URL || window.location.origin, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      // Synchronize this specific browser node to the user's private channel
      socket.emit('join_room', user._id);

      // Listen for automated BTC Watcher credits or Admin adjustments
      socket.on('balanceUpdate', (data) => {
        if (data.balances) {
          setBalances(prev => ({ ...prev, ...data.balances }));
        }
        toast.success(data.message || 'Account Assets Updated', {
          icon: '💰',
          duration: 6000,
          style: { background: '#0a0c10', color: '#fff', border: '1px solid #10b981' }
        });
      });

      return () => {
        socket.off('balanceUpdate');
        socket.disconnect();
      };
    }
  }, [isAuthenticated, user?._id]);

  // ── 📊 DATA FETCHING ──
  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await api.get(API_ENDPOINTS.USER.BALANCES);
      if (res.data?.success) {
        // Safe merge with defaults to prevent "undefined" rendering errors
        setBalances(prev => ({ ...prev, ...res.data.balances }));
      }
    } catch (err) {
      if (err.status !== 401) {
        toast.error('Network Protocol Error: Failed to sync vault.');
      }
    }
  }, []);

  const handleSync = async () => {
    const syncId = toast.loading('Synchronizing Global Ledger...');
    try {
      const res = await api.post(API_ENDPOINTS.USER.SYNC);
      if (res.data.success) {
        setBalances(prev => ({ ...prev, ...res.data.balances }));
        toast.success('Portfolio Valuation Updated', { id: syncId });
      }
    } catch (err) {
      toast.error('Sync Timeout: Please try again.', { id: syncId });
    }
  };

  const handleCompound = async () => {
    try {
      const res = await api.post(API_ENDPOINTS.USER.COMPOUND);
      if (res.data.success) {
        setBalances(prev => ({ ...prev, ...res.data.balances }));
        toast.success('Yield Reinvested into Principal');
      }
    } catch (err) {
      toast.error(err.message || 'Minimum €10.00 required');
    }
  };

  useEffect(() => {
    if (initialized) {
      if (!isAuthenticated) {
        navigate('/login');
      } else {
        fetchDashboardData().finally(() => setLoading(false));
      }
    }
  }, [initialized, isAuthenticated, navigate, fetchDashboardData]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  const navLinks = [
    { icon: LayoutDashboard, label: "Portfolio Overview", path: "/dashboard", active: true },
    { icon: PlusCircle, label: "Fund Management", path: "/dashboard/deposit" },
    { icon: ArrowUpRight, label: "Asset Withdrawal", path: "/dashboard/withdrawal" },
    { icon: History, label: "Audit History", path: "/dashboard/ledger" },
  ];

  return (
    <div className="flex min-h-screen bg-[#020408] text-white overflow-hidden font-sans">
      
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex w-80 bg-[#0a0c10] border-r border-white/5 p-8 flex-col h-screen">
        <div className="flex items-center gap-3 mb-16 cursor-pointer" onClick={() => navigate('/')}>
          <ShieldCheck className="text-emerald-500" size={32} />
          <h1 className="text-2xl font-black tracking-tighter">TRUSTRA</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => (
            <SidebarLink 
              key={link.label}
              icon={link.icon} 
              label={link.label} 
              active={link.active} 
              onClick={() => navigate(link.path)} 
            />
          ))}
        </nav>

        <button 
          onClick={logout} 
          className="mt-auto flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-rose-400 transition-all border-t border-white/5 pt-8"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
        </button>
      </aside>

      {/* ── MOBILE OVERLAY MENU ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-[#020408] p-8 lg:hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" /> 
              <span className="font-black tracking-tighter text-xl">TRUSTRA</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-full"><X /></button>
          </div>
          <div className="space-y-4">
            {navLinks.map((link) => (
              <button 
                key={link.label}
                onClick={() => { navigate(link.path); setIsMobileMenuOpen(false); }}
                className="w-full text-left p-6 bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/5 active:bg-emerald-600 active:text-black"
              >
                {link.label}
              </button>
            ))}
            <button onClick={logout} className="w-full text-left p-6 text-rose-500 text-xs font-black uppercase tracking-widest mt-4">Sign Out</button>
          </div>
        </div>
      )}

      {/* ── MAIN ANALYTICS HUB ── */}
      <main className="flex-1 overflow-y-auto h-screen p-6 lg:p-12 space-y-12">
        
        {/* Header Section */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 bg-white/5 border border-white/10 rounded-xl"><Menu size={20}/></button>
            <div>
              <h2 className="text-xl lg:text-2xl font-black tracking-tighter uppercase italic leading-none">Institutional Hub</h2>
              <p className="text-[9px] lg:text-[10px] text-gray-500 uppercase tracking-widest mt-1">Client Node: {user?.name || 'Authorized Entity'}</p>
            </div>
          </div>
          <button 
            onClick={handleSync} 
            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all group"
          >
            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
            Update Valuation
          </button>
        </header>

        {/* Hero AUM Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-8 lg:p-12 rounded-[2rem] lg:rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={120} className="text-emerald-500" />
            </div>
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6">AUM (Assets Under Management)</h3>
            <div className="text-5xl lg:text-7xl font-black italic tracking-tighter text-white">
              €{(balances?.EUR || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest gap-2 items-center">
                <TrendingUp size={12} /> +€{(balances?.ROI || 0).toLocaleString('de-DE')} Yield
              </div>
              <div className="inline-flex px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest gap-2 items-center">
                <Zap size={12} /> {balances?.BTC?.toFixed(4) || '0.0000'} BTC Node
              </div>
            </div>
          </div>

          <div className="bg-[#0a0c10] border border-white/5 p-8 lg:p-10 rounded-[2rem] lg:rounded-[3rem] flex flex-col justify-between gap-8">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Protocol</p>
              <h4 className="text-2xl font-black italic text-white mt-1">{user?.activePlan || 'Rio Elite'}</h4>
              <div className="mt-2 w-12 h-1 bg-emerald-500 rounded-full"></div>
            </div>
            <button 
              onClick={() => navigate('/dashboard/deposit')} 
              className="w-full bg-emerald-600 text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/10"
            >
              Inject Capital
            </button>
          </div>
        </div>

        {/* Action Protocol Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={handleCompound} className="p-8 bg-[#0a0c10] border border-white/5 rounded-[2rem] text-left group hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="text-blue-400" size={24} />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Reinvestment</h4>
            <p className="text-[9px] text-gray-500 mt-2 uppercase tracking-widest leading-relaxed">Compound current realized gains into your principal node.</p>
          </button>
          
          <button onClick={() => navigate('/dashboard/deposit')} className="p-8 bg-[#0a0c10] border border-white/5 rounded-[2rem] text-left group hover:border-emerald-400/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="text-emerald-400" size={24} />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Secure Deposit</h4>
            <p className="text-[9px] text-gray-500 mt-2 uppercase tracking-widest leading-relaxed">Increase portfolio liquidity via SEPA or Digital Assets.</p>
          </button>

          <button onClick={() => navigate('/dashboard/withdrawal')} className="p-8 bg-[#0a0c10] border border-white/5 rounded-[2rem] text-left group hover:border-rose-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="text-rose-400" size={24} />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Asset Exit</h4>
            <p className="text-[9px] text-gray-500 mt-2 uppercase tracking-widest leading-relaxed">Initiate secure withdrawal audit to external destination.</p>
          </button>
        </div>
      </main>
    </div>
  );
}

