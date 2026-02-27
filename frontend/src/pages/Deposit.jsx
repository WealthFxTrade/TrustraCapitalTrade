import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Zap,
  History,
  Repeat,
  PlusCircle,
  LogOut,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import api from '../api/api';
import { API_ENDPOINTS } from '../constants/api'; // ← centralized

function SidebarLink({ to, icon, label, active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
        active
          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40'
          : 'text-gray-500 hover:bg-white/5 hover:text-white'
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

  const [method, setMethod] = useState('BTC');
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [suggestedAmount, setSuggestedAmount] = useState(''); // optional input

  const loadDeposit = useCallback(async (fresh = false) => {
    if (!user) return navigate('/login');

    setLoading(true);
    try {
      // Use centralized endpoint
      const endpoint = API_ENDPOINTS.WALLET_ADDRESS(method);
      const url = fresh ? `${endpoint}?fresh=true` : endpoint;
      const res = await api.get(url);

      if (res?.data?.success) {
        setDeposit(res.data.data || res.data);
      } else {
        setDeposit(res.data);
      }
    } catch (err) {
      console.error('Deposit address error:', err);
      toast.error(err.response?.data?.message || 'Failed to load deposit address');
      setDeposit(null);
    } finally {
      setLoading(false);
    }
  }, [method, user, navigate]);

  useEffect(() => {
    loadDeposit();
  }, [loadDeposit]);

  const copyAddress = async () => {
    if (!deposit?.address) return;
    try {
      await navigator.clipboard.writeText(deposit.address);
      setCopied(true);
      toast.success(`${method} Address Copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Clipboard access failed');
    }
  };

  const refreshAddress = () => loadDeposit(true);

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
          <SidebarLink to="/plans" icon={<Zap size={18}/>} label="ALL PLANS" active={location.pathname === '/plans'} />
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
            Node Connected: {method} Gateway
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-indigo-400">ID: {user?.id?.slice(-6) || 'N/A'}</span>
          </div>
        </header>

        <main className="p-6 md:p-12 max-w-4xl w-full mx-auto space-y-12">
          <section>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Deposit <span className="text-indigo-500">Funds</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 italic">Secure Asset Transfer</p>
          </section>

          {/* Warning Banner */}
          <div className="bg-red-900/30 border border-red-500/50 rounded-3xl p-6 flex items-start gap-4">
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-red-300 mb-2">High-Risk Warning</h4>
              <p className="text-red-200 text-sm">
                Cryptocurrency deposits carry significant risk of total loss. Only use funds you can afford to lose. This platform is for informational purposes only — investments are not guaranteed.
              </p>
            </div>
          </div>

          <div className="bg-[#0f1218] border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-600/10 transition-all" />

            {/* Method Selector */}
            <div className="flex flex-wrap gap-2 mb-12">
              {['BTC', 'ETH', 'USDT', 'LTC'].map((coin) => (
                <button
                  key={coin}
                  onClick={() => setMethod(coin)}
                  className={`px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all ${
                    method === coin
                      ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 border border-indigo-500'
                      : 'bg-white/5 text-gray-500 border border-white/5 hover:border-white/10'
                  }`}
                >
                  {coin}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-20 gap-6">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Loading Gateway...</p>
              </div>
            ) : deposit?.address ? (
              <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
                {/* QR Code */}
                <div className="flex justify-center bg-white p-6 rounded-[2.5rem] w-fit mx-auto shadow-2xl border-8 border-white/5">
                  <QRCodeSVG value={`bitcoin:\( {deposit.address}?amount= \){suggestedAmount || 0}`} size={220} level="H" />
                </div>

                {/* Address */}
                <div className="space-y-6 text-center">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">Deposit Address</p>
                  <div className="relative max-w-md mx-auto group/addr">
                    <div className="bg-black/60 border border-white/5 rounded-2xl p-6 pr-16 font-mono text-xs text-indigo-400 break-all leading-relaxed shadow-inner group-hover/addr:border-indigo-500/30 transition-all">
                      {deposit.address}
                    </div>
                    <button
                      onClick={copyAddress}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all active:scale-90"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                {/* Suggested Amount (optional) */}
                <div className="max-w-md mx-auto">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Suggested Amount ({method})
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={suggestedAmount}
                    onChange={(e) => setSuggestedAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/60 border border-white/10 rounded-xl py-4 px-5 text-white text-center font-mono focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Refresh */}
                <div className="flex justify-center">
                  <button
                    onClick={refreshAddress}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-900/50 hover:bg-indigo-800 rounded-xl text-indigo-300 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <RefreshCw size={14} /> Generate New Address
                  </button>
                </div>

                {/* Confirmations Fake UI – toned down */}
                <div className="flex items-center gap-3 justify-center text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] bg-emerald-500/5 py-4 rounded-2xl border border-emerald-500/10">
                  <RefreshCw size={12} className="animate-spin" />
                  Awaiting Network Confirmation...
                </div>
              </div>
            ) : (
              <p className="text-center text-red-400 py-10">No deposit address available. Try refreshing or contact support.</p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Important</p>
              <p className="text-[9px] font-bold text-slate-600 leading-relaxed uppercase">
                Only send {method} to this exact address. Sending wrong network/coin results in permanent loss.
              </p>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Processing</p>
              <p className="text-[9px] font-bold text-slate-600 leading-relaxed uppercase">
                Deposits appear after network confirmations (typically 10–60 minutes depending on chain congestion).
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
