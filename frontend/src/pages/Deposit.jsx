// src/pages/Deposit.jsx - Merged Production v8.4.1
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Zap, History, Repeat, PlusCircle, LogOut,
  Copy, Check, RefreshCw, Loader2, AlertTriangle, ShieldCheck, ArrowRight
} from 'lucide-react';
import api from '../api/api';
import { API_ENDPOINTS } from '../constants/api';

function SidebarLink({ to, icon, label, active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
        active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-gray-500 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-[10px] font-black tracking-widest">{label}</span>
    </Link>
  );
}

export default function Deposit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [method] = useState('BTC'); // Default to BTC
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadDeposit = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Direct call to profile to get the derived bc1q address
      const res = await api.get(API_ENDPOINTS.USER.PROFILE);
      const userData = res.data.user || res.data;
      
      if (userData?.btcAddress) {
        setDeposit({ address: userData.btcAddress });
      } else {
        toast.error('Bitcoin Node not yet initialized for this account');
      }
    } catch (err) {
      toast.error('Failed to connect to Trustra Node');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDeposit();
  }, [loadDeposit]);

  const copyAddress = async () => {
    if (!deposit?.address) return;
    await navigator.clipboard.writeText(deposit.address);
    setCopied(true);
    toast.success('Secure Address Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen p-8">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Zap size={22} className="text-white fill-current" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">Trustra</span>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-6 px-4">Navigation</p>
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18}/>} label="DASHBOARD" active={location.pathname === '/dashboard'} />
          <SidebarLink to="/plans" icon={<Zap size={18}/>} label="ALL PLANS" />
          <SidebarLink to="/investments" icon={<History size={18}/>} label="INVESTMENT LOGS" />
          <SidebarLink to="/deposit" icon={<PlusCircle size={18}/>} label="DEPOSIT" active={true} />
          <SidebarLink to="/exchange" icon={<Repeat size={18}/>} label="EXCHANGE" />
        </nav>

        <button onClick={logout} className="mt-auto flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest">
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Node Connected: {method} SegWit Gateway
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
              Audit Protocol v8.4.1
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-12 max-w-5xl mx-auto w-full">
          <div className="mb-12">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Deposit Funds</h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Unique Investor Address Protocol</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            {/* Left: QR & Address */}
            <div className="lg:col-span-3 space-y-8">
              <div className="bg-[#0a0c10] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30" />
                
                <div className="flex flex-col items-center gap-8">
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    {loading ? (
                      <div className="w-[200px] h-[200px] flex items-center justify-center">
                        <Loader2 className="animate-spin text-indigo-600" size={40} />
                      </div>
                    ) : (
                      <QRCodeSVG value={deposit?.address || "generating..."} size={200} />
                    )}
                  </div>

                  <div className="w-full space-y-4">
                    <p className="text-center text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Your Personal BTC Address</p>
                    <div 
                      onClick={copyAddress}
                      className="bg-black/40 border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 transition-all flex items-center justify-between group/addr"
                    >
                      <code className="text-xs font-mono text-gray-300 break-all select-none">
                        {loading ? 'Initializing Secure Node...' : (deposit?.address || 'Derivation Failed')}
                      </code>
                      {copied ? <Check className="text-emerald-500" size={20} /> : <Copy className="text-gray-600 group-hover/addr:text-indigo-400" size={20} />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-2xl flex gap-4">
                <ShieldCheck size={24} className="text-indigo-400 shrink-0" />
                <p className="text-xs text-indigo-200/60 leading-relaxed italic">
                  This address is unique to your portfolio. Deposits are automatically recognized by the Trustra Watcher Node upon 2 network confirmations.
                </p>
              </div>
            </div>

            {/* Right: Steps/Rules */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] h-full">
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8 border-b border-white/5 pb-4">Transfer Guidelines</h3>
                
                <ul className="space-y-8">
                  {[
                    { step: '01', title: 'Network', text: 'Send ONLY Bitcoin (BTC) to this address. Using other chains (BEP20/ERC20) will result in permanent loss.' },
                    { step: '02', title: 'Timing', text: 'Address is permanent. You can reuse this bc1q address for future top-ups.' },
                    { step: '03', title: 'Validation', text: 'Crediting occurs automatically within 10–30 minutes after network confirmation.' }
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-4">
                      <span className="text-indigo-600 font-black italic text-lg">{item.step}</span>
                      <div>
                        <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">{item.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => navigate('/investments')}
                  className="w-full mt-12 py-4 bg-white/5 hover:bg-indigo-600/20 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                >
                  View History <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
          
          <footer className="mt-20 pt-8 border-t border-white/5 text-center">
            <p className="text-[9px] text-gray-700 uppercase font-black tracking-[0.4em] leading-loose">
              Audit Protocol v8.4.1 Certified Node | © 2016–2026 Trustra Capital Trade
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

