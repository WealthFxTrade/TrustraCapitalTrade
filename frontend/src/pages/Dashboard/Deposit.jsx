import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Zap,
  History,
  Repeat,
  PlusCircle,
  LogOut,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  Globe,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

/** ── SIDEBAR LINK COMPONENT ── */
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

/** ── REQUIREMENT ITEM HELPER ── */
function RequirementItem({ label, value }) {
  return (
    <li className="flex justify-between items-center border-b border-white/5 pb-3">
      <span className="text-[9px] font-bold uppercase text-white/20 tracking-widest">{label}</span>
      <span className="text-[10px] font-black uppercase italic text-white tracking-tighter">{value}</span>
    </li>
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

  /** ── 🛰️ LOAD DEPOSIT ADDRESS ── */
  const loadDepositAddress = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Targets router.get('/user/deposit-address') in your backend
      const res = await api.get('/user/deposit-address?asset=BTC');
      if (res.data?.address) {
        setDepositAddress(res.data.address);
      } else {
        throw new Error('Inbound gateway not initialized.');
      }
    } catch (err) {
      console.error('Deposit address load failed:', err);
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDepositAddress();
  }, [loadDepositAddress]);

  /** ── 📋 CLIPBOARD PROTOCOL ── */
  const copyToClipboard = useCallback(async () => {
    if (!depositAddress) return toast.error('Address node offline.');

    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      toast.success('Protocol Address Copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Manual Copy Required');
    }
  }, [depositAddress]);

  const getErrorMessage = (err) => {
    if (err.response?.data?.message) return err.response.data.message;
    const status = err.response?.status;
    if (status === 401 || status === 403) return 'Session Expired';
    if (!err.response && err.request) return 'Network Latency Error';
    return 'Gateway Offline';
  };

  return (
    <div className="flex min-h-screen bg-[#020408] text-white font-sans selection:bg-yellow-500/20">
      
      {/* ── SIDEBAR ── */}
      <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-xl p-8 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-16 px-4">
          <div className="bg-yellow-500 p-1.5 rounded-lg text-black">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">
            Trustra <span className="text-white/40 font-light">Node</span>
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Terminal" active={location.pathname === '/dashboard'} />
          <SidebarLink to="/dashboard/deposit" icon={PlusCircle} label="Inbound" active={location.pathname === '/dashboard/deposit'} />
          <SidebarLink to="/dashboard/withdrawal" icon={Repeat} label="Outbound" />
          <SidebarLink to="/dashboard/ledger" icon={History} label="Ledger" />
        </nav>

        <button 
          onClick={logout}
          className="mt-auto flex items-center gap-4 px-5 py-4 text-gray-500 hover:text-red-500 transition-colors group"
        >
          <LogOut size={18} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terminate</span>
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 p-6 lg:p-16 pt-28">
        <div className="max-w-4xl mx-auto">
          
          {/* HEADER SECTION */}
          <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4 text-yellow-500">
                <Globe size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Zurich Gateway v2.1</span>
              </div>
              <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                Deposit <span className="text-yellow-500">Assets</span>
              </h1>
            </div>
            
            <button 
              onClick={loadDepositAddress}
              disabled={loading}
              className="text-white/20 hover:text-yellow-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Scanning...' : 'Re-Scan Node'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            
            {/* LEFT COLUMN: GUIDELINES */}
            <div className="lg:col-span-2 space-y-8">
              <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-md">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Protocol Requirements</h3>
                <ul className="space-y-4">
                  <RequirementItem label="Min. Deposit" value="0.0001 BTC" />
                  <RequirementItem label="Confirmations" value="2 Blocks" />
                  <RequirementItem label="Network" value="Bitcoin (Mainnet)" />
                  <RequirementItem label="Processing" value="Instant" />
                </ul>
              </div>

              <div className="flex items-start gap-4 p-6 bg-red-500/5 border border-red-500/10 rounded-3xl">
                <AlertCircle className="text-red-500 shrink-0 mt-1" size={18} />
                <p className="text-[9px] font-black uppercase leading-relaxed text-red-400 tracking-tighter">
                  Warning: send only <span className="text-white underline">BTC</span> to this node. 
                  Incompatible assets will cause irreversible synchronization failure.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: ADDRESS INTERFACE */}
            <div className="lg:col-span-3">
              <div className="bg-[#0A0C10] border border-white/5 rounded-[3rem] p-12 backdrop-blur-md flex flex-col items-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck size={120} />
                </div>

                {loading ? (
                  <div className="py-24 flex flex-col items-center gap-6">
                    <Loader2 size={40} className="text-yellow-500 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Syncing Gateway...</span>
                  </div>
                ) : error ? (
                  <div className="py-24 text-center space-y-6">
                    <AlertTriangle size={48} className="text-red-500 mx-auto" />
                    <p className="text-sm font-bold text-red-400 uppercase tracking-widest">{error}</p>
                    <button onClick={loadDepositAddress} className="text-[10px] font-black uppercase underline decoration-red-500/50">Retry Handshake</button>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-yellow-500/10 mb-10 group-hover:scale-105 transition-transform duration-700">
                      <QRCodeSVG 
                        value={depositAddress} 
                        size={200} 
                        bgColor="#ffffff" 
                        fgColor="#000000" 
                        level="H"
                        includeMargin={false}
                      />
                    </div>

                    <div className="w-full space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Unique Node Address</p>
                      <div 
                        onClick={copyToClipboard}
                        className="w-full bg-black border border-white/5 p-6 rounded-2xl flex items-center justify-between cursor-pointer group/copy hover:border-yellow-500/30 transition-all active:scale-95"
                      >
                        <span className="font-mono text-xs text-yellow-500 break-all select-all pr-4">{depositAddress}</span>
                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-white/10 group-hover/copy:text-white transition-colors" />}
                      </div>
                    </div>

                    <div className="mt-12 flex items-center gap-4 py-4 px-8 bg-white/5 rounded-full border border-white/5">
                      <ShieldCheck className="text-green-500" size={16} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                        ZURICH SECURE VAULT // SSL v3
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

