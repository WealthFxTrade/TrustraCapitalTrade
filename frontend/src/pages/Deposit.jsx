import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; // ✅ Added for context logout
import {
  LayoutDashboard, Zap, History, Repeat, PlusCircle,
  Wallet, LogOut, Copy, Check, RefreshCw, Loader2,
  TrendingUp, ChevronRight, Globe, User
} from 'lucide-react';
import api from '../api/api'; // ✅ Matches your main api instance

export default function Deposit() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ✅ Use central logout
  const [method, setMethod] = useState('BTC');
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load Crypto Address
  const loadDeposit = useCallback(async (fresh = false) => {
    try {
      setLoading(true);
      // ✅ Updated path to match typical REST patterns: /wallet/address/:coin
      const res = await api.get(`/wallet/address/${method}${fresh ? '?fresh=true' : ''}`);
      setDeposit(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load gateway');
    } finally {
      setLoading(false);
    }
  }, [method]);

  useEffect(() => {
    loadDeposit();
  }, [loadDeposit]);

  const copyAddress = () => {
    if (!deposit?.address) return;
    navigator.clipboard.writeText(deposit.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(`${method} Address Copied`);
  };

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-500/30">
      
      {/* --- SIDEBAR NAVIGATION (Matches Dashboard) --- */}
      <aside className="w-full md:w-72 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen p-6 space-y-8">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Zap size={22} className="text-white fill-current" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">TrustraCapital</span>
        </div>

        <nav className="space-y-1">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 px-3">Main Menu</p>
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18}/>} label="DASHBOARD" />
          <SidebarLink to="/plans" icon={<Zap size={18}/>} label="ALL SCHEMA" />
          <SidebarLink to="/investments" icon={<History size={18}/>} label="SCHEMA LOGS" />
          <SidebarLink to="/deposit" icon={<PlusCircle size={18}/>} label="ADD MONEY" active />
          <SidebarLink to="/exchange" icon={<Repeat size={18}/>} label="WALLET EXCHANGE" />
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Secure Gateway v8.4
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition">
            Sign Out <LogOut size={16} />
          </button>
        </header>

        <main className="p-6 md:p-12 max-w-4xl w-full mx-auto space-y-12">
          <section>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Add <span className="text-indigo-500">Money</span></h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Node Funding Protocol • 2026 Directives</p>
          </section>

          <div className="bg-[#0f1218] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl" />
            
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-600 mb-6">Select Asset Gateway</label>
            <div className="flex flex-wrap gap-3 mb-12">
              {['BTC', 'ETH', 'USDT', 'LTC'].map((coin) => (
                <button
                  key={coin}
                  onClick={() => setMethod(coin)}
                  className={`px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all border ${
                    method === coin ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/40' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                  }`}
                >
                  {coin}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Generating Secure Node...</p>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-center bg-white p-6 rounded-[2.5rem] w-fit mx-auto shadow-2xl shadow-indigo-500/10 border-8 border-white/5">
                  <QRCodeSVG value={deposit?.address || 'Trustra'} size={200} level="H" />
                </div>

                <div className="space-y-4 text-center">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Personal {method} Node Address</p>
                  <div className="relative max-w-md mx-auto group">
                    <div className="bg-black/60 border border-white/10 rounded-2xl p-6 pr-16 font-mono text-xs text-indigo-400 break-all leading-relaxed shadow-inner">
                      {deposit?.address || 'Syncing Node Address...'}
                    </div>
                    <button 
                      onClick={copyAddress}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all shadow-lg active:scale-95"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-center text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] bg-emerald-500/5 py-3 rounded-full border border-emerald-500/10">
                   <RefreshCw size={12} className="animate-spin" /> Waiting for network confirmation
                </div>
              </div>
            )}
          </div>

          <footer className="text-center opacity-30">
             <p className="text-[9px] font-black uppercase tracking-[0.5em]">Trustra Secure Exchange • 2016-2026</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// Sidebar Link Component (Helper)
function SidebarLink({ to, icon, label, active = false }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${
        active 
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' 
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

