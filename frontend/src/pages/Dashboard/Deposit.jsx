import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Zap, History, Repeat, PlusCircle, LogOut,
  Copy, Check, Loader2, ShieldCheck, AlertTriangle, ChevronLeft, Globe
} from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../context/AuthContext';

// Reusable Sidebar Link with Mainframe styling
function SidebarLink({ to, icon: Icon, label, active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
        active
          ? 'bg-yellow-500 text-black shadow-xl shadow-yellow-500/20'
          : 'text-gray-500 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={18} className={active ? 'text-black' : 'text-gray-500 group-hover:text-white'} />
      <span className="text-[10px] font-black tracking-[0.2em] uppercase italic">{label}</span>
    </Link>
  );
}

export default function Deposit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [depositAddress, setDepositAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadDepositAddress = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/user/deposit-address?asset=BTC');
      if (res.data?.address) {
        setDepositAddress(res.data.address);
      } else {
        throw new Error('No address returned from server');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Node Handshake Failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadDepositAddress(); }, [loadDepositAddress]);

  const copyToClipboard = useCallback(async () => {
    if (!depositAddress) return;
    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      toast.success('Protocol Address Copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Manual Copy Required');
    }
  }, [depositAddress]);

  return (
    <div className="flex min-h-screen bg-[#020408] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden">
      
      {/* Sidebar - Persistent technical rail */}
      <aside className="w-72 bg-[#05070a] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
            <Zap size={22} className="text-black fill-current" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">Trustra</span>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-6 px-4">Core Terminal</p>
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/dashboard'} />
          <SidebarLink to="/plans" icon={Zap} label="Node Access" />
          <SidebarLink to="/investments" icon={History} label="Ledger" />
          <SidebarLink to="/deposit" icon={PlusCircle} label="Deposit" active={location.pathname === '/deposit'} />
          <SidebarLink to="/exchange" icon={Repeat} label="Exchange" />
        </nav>

        <button onClick={logout} className="mt-auto flex items-center gap-4 px-6 py-4 text-gray-600 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest">
          <LogOut size={18} /> Disconnect Node
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header - Global Status */}
        <header className="h-20 border-b border-white/5 bg-[#020408]/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">BTC Gateway: Operational</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <Globe size={14} className="text-gray-600" />
             <span className="text-[9px] font-black text-yellow-500/60 uppercase tracking-widest">Tier-1 Liquidity Protocol</span>
          </div>
        </header>

        <main className="p-6 md:p-12 max-w-6xl mx-auto w-full space-y-12">
          
          <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-yellow-500 transition-colors">
              <ChevronLeft size={14} /> Previous Module
            </button>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
              Liquidity <span className="text-yellow-500">Provisioning</span>
            </h1>
          </div>

          {error ? (
            <div className="bg-red-500/5 border border-red-500/20 rounded-[2.5rem] p-12 text-center space-y-6">
              <AlertTriangle size={48} className="mx-auto text-red-500" />
              <h3 className="text-xl font-black uppercase italic">Node Initialization Failed</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">{error}</p>
              <button onClick={loadDepositAddress} className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-yellow-500 transition-all">
                Attempt Reconnect
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-8">
              
              {/* Vault Card (Left) */}
              <div className="lg:col-span-3 bg-[#0a0c10] border border-white/5 rounded-[3.5rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                  <ShieldCheck size={200} />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-10">
                  <div className="p-6 bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    {loading ? (
                      <div className="w-48 h-48 flex items-center justify-center">
                        <Loader2 className="animate-spin text-yellow-500" size={40} />
                      </div>
                    ) : (
                      <QRCodeSVG value={depositAddress || ''} size={192} level="H" />
                    )}
                  </div>

                  <div className="w-full space-y-6">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Encrypted Receiving String</p>
                    </div>
                    
                    <div onClick={copyToClipboard} className={`group flex items-center justify-between bg-black/40 border ${copied ? 'border-emerald-500/50' : 'border-white/5'} p-6 rounded-2xl cursor-pointer hover:border-yellow-500/30 transition-all`}>
                      <code className="text-xs md:text-sm font-mono text-gray-300 break-all select-none">
                        {loading ? 'Decrypting node address...' : depositAddress}
                      </code>
                      <div className="shrink-0 p-3 bg-white/5 rounded-xl group-hover:bg-yellow-500 group-hover:text-black transition-all">
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions Panel (Right) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] h-full">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-8 flex items-center gap-3">
                    <ShieldCheck size={16} className="text-yellow-500" /> Protocol Requirements
                  </h3>
                  
                  <div className="space-y-8">
                    {[
                      { title: 'Asset Verification', text: 'Strictly Bitcoin (BTC). Multi-chain cross-pollination will result in asset loss.' },
                      { title: 'Confirmation Cycle', text: 'Typically 2–6 network validations (20-90 min).' },
                      { title: 'Persistent Node', text: 'This address is tied to your ID and can be reused for future provisioning.' }
                    ].map((item, i) => (
                      <div key={i} className="space-y-2 border-l-2 border-yellow-500/20 pl-6">
                        <h4 className="text-[10px] font-black text-white uppercase italic tracking-widest">{item.title}</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed font-bold uppercase tracking-tighter">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
