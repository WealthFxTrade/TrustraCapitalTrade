import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, Zap, History, Repeat, PlusCircle, LogOut, 
  Copy, Check, Loader2, ShieldCheck, ArrowRight 
} from 'lucide-react';

import api from '../api/api';
import { useAuth } from '../context/AuthContext';

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
      <span className="text-[10px] font-black tracking-widest">{label}</span>
    </Link>
  );
}

export default function Deposit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadDeposit = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Logic Fix: Triggering the derivation endpoint directly
      const res = await api.get('/user/deposit-address?asset=BTC');
      const addressData = res.data;

      if (addressData && addressData.address) {
        setDeposit({ address: addressData.address });
      } else {
        toast.error('Bitcoin Node initialization required.');
      }
    } catch (err) {
      console.error('Connection Error:', err);
      toast.error(err.response?.data?.message || 'Failed to connect to Trustra Node');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDeposit();
  }, [loadDeposit]);

  const copyAddress = async () => {
    if (!deposit?.address) return;
    try {
      await navigator.clipboard.writeText(deposit.address);
      setCopied(true);
      toast.success('Secure Address Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Manual copy required.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white font-sans selection:bg-yellow-500/30">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen p-8">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Zap size={22} className="text-black fill-current" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">Trustra</span>
        </div>
        <nav className="flex-1 space-y-2">
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-6 px-4">Navigation</p>
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="DASHBOARD" active={location.pathname === '/dashboard'} />
          <SidebarLink to="/plans" icon={Zap} label="ALL PLANS" />
          <SidebarLink to="/investments" icon={History} label="INVESTMENT LOGS" />
          <SidebarLink to="/deposit" icon={PlusCircle} label="DEPOSIT" active={true} />
          <SidebarLink to="/exchange" icon={Repeat} label="EXCHANGE" />
        </nav>
        <button onClick={logout} className="mt-auto flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest">
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Node Status: BTC SegWit Gateway Active
          </div>
          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest italic">Audit Protocol v8.4.2</span>
        </header>

        <main className="flex-1 p-8 lg:p-12 max-w-5xl mx-auto w-full">
          <div className="mb-12">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Deposit Funds</h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Unique Investor Address Protocol</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-8">
              <div className="bg-[#0a0c10] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-30" />
                <div className="flex flex-col items-center gap-8">
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    {loading ? (
                      <div className="w-[200px] h-[200px] flex items-center justify-center">
                        <Loader2 className="animate-spin text-yellow-500" size={40} />
                      </div>
                    ) : (
                      <QRCodeSVG value={deposit?.address || "initializing..."} size={200} />
                    )}
                  </div>
                  <div className="w-full space-y-4 text-center">
                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em]">Your Personal BTC Address</p>
                    <div onClick={copyAddress} className="bg-black/40 border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-yellow-500/50 transition-all flex items-center justify-between group/addr">
                      <code className="text-xs font-mono text-gray-300 break-all select-none">
                        {loading ? 'Synchronizing Secure Node...' : (deposit?.address || 'Derivation Failed')}
                      </code>
                      {copied ? <Check className="text-emerald-500" size={20} /> : <Copy className="text-gray-600 group-hover/addr:text-yellow-400" size={20} />}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-500/5 border border-yellow-500/10 p-6 rounded-2xl flex gap-4">
                <ShieldCheck size={24} className="text-yellow-500 shrink-0" />
                <p className="text-xs text-yellow-200/60 leading-relaxed italic">
                  This address is unique to your portfolio. Deposits are automatically recognized upon 2 network confirmations.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] h-full">
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8 border-b border-white/5 pb-4">Transfer Guidelines</h3>
                <ul className="space-y-8">
                  {[
                    { step: '01', title: 'Network', text: 'Send ONLY Bitcoin (BTC) to this address. Using other chains will result in loss.' },
                    { step: '02', title: 'Permanent', text: 'This address is yours forever. You can reuse it for future top-ups.' },
                    { step: '03', title: 'Validation', text: 'Crediting occurs automatically after network confirmation.' }
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-4">
                      <span className="text-yellow-500 font-black italic text-lg">{item.step}</span>
                      <div>
                        <p className="text-[10px] font-black uppercase text-yellow-500 mb-1">{item.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
