// src/pages/Dashboard/Deposit.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, ArrowDownLeft, ArrowUpRight, History, LogOut,
  Copy, Check, Loader2, ShieldCheck, AlertTriangle, Wallet, Info, Globe, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

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
      <Icon size={18} className={active ? 'text-black' : 'group-hover:text-emerald-500'} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

export default function Deposit() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, initialized } = useAuth();

  const [method, setMethod] = useState('crypto');
  const [asset, setAsset] = useState('USDT');
  const [depositData, setDepositData] = useState({ address: '', memo: '' });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadDepositAddress = useCallback(async () => {
    if (!isAuthenticated || method !== 'crypto') return;
    setLoading(true);
    try {
      // Hits: GET /user/deposit-address?asset=BTC
      const res = await api.get(`${API_ENDPOINTS.USER.UPDATE.replace('update', 'deposit-address')}?asset=${asset}`);
      if (res.data?.success) {
        setDepositData({
          address: res.data.address,
          memo: res.data.memo || ''
        });
      }
    } catch (err) {
      toast.error('Vault Sync Failed: BTC Node Offline');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, asset, method]);

  useEffect(() => {
    if (initialized) {
      if (!isAuthenticated) navigate('/login');
      else loadDepositAddress();
    }
  }, [initialized, isAuthenticated, loadDepositAddress, navigate]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Address Copied to Secure Clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Clipboard Access Denied');
    }
  };

  if (!initialized || !user) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#020408] text-white overflow-hidden font-sans">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex w-80 bg-[#0a0c10] border-r border-white/5 p-8 flex-col h-screen">
        <div className="flex items-center gap-3 mb-16 cursor-pointer" onClick={() => navigate('/')}>
          <ShieldCheck className="text-emerald-500" size={32} />
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Trustra</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <SidebarLink icon={LayoutDashboard} label="Portfolio" onClick={() => navigate('/dashboard')} />
          <SidebarLink icon={ArrowDownLeft} label="Capital Injection" active onClick={() => navigate('/dashboard/deposit')} />
          <SidebarLink icon={ArrowUpRight} label="Asset Withdrawal" onClick={() => navigate('/dashboard/withdrawal')} />
          <SidebarLink icon={History} label="Audit History" onClick={() => navigate('/dashboard/ledger')} />
        </nav>
        <button onClick={logout} className="mt-auto flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-rose-400 transition-all border-t border-white/5 pt-8">
          <LogOut size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">End Session</span>
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto h-screen p-6 lg:p-12 space-y-12">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Capital Injection</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Node Security: SSL v3 Encrypted</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
            <Globe size={12} className="text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Global Liquidity Pool Active</span>
          </div>
        </header>

        {/* Toggle Protocol */}
        <div className="flex p-1.5 bg-[#0a0c10] border border-white/5 rounded-2xl max-w-sm">
          {['crypto', 'bank'].map((type) => (
            <button
              key={type}
              onClick={() => setMethod(type)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                method === type ? 'bg-emerald-600 text-black shadow-lg' : 'text-gray-500 hover:text-white'
              }`}
            >
              {type === 'crypto' ? 'Digital Assets' : 'Fiat Wire'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ── LEFT: INTERFACE ── */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {method === 'crypto' ? (
                <motion.div key="crypto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center gap-8 relative overflow-hidden">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl relative z-10">
                      {loading ? (
                        <div className="w-52 h-52 flex items-center justify-center bg-black rounded-xl">
                          <Loader2 className="animate-spin text-emerald-500" size={40} />
                        </div>
                      ) : (
                        <QRCodeSVG value={depositData.address || "Trustra"} size={208} level="H" />
                      )}
                    </div>

                    <div className="flex gap-2 w-full">
                      {['USDT', 'BTC', 'ETH'].map((coin) => (
                        <button
                          key={coin}
                          onClick={() => setAsset(coin)}
                          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            asset === coin ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'border-white/5 text-gray-500'
                          }`}
                        >
                          {coin}
                        </button>
                      ))}
                    </div>

                    <div className="w-full space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Public Vault Address ({asset})</label>
                        <div className="bg-black border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:border-emerald-500/50 transition-all">
                          <span className="text-[11px] font-mono text-gray-300 break-all select-all">{depositData.address || 'Generating...'}</span>
                          <button onClick={() => copyToClipboard(depositData.address)} className="p-2 text-emerald-500 hover:scale-110 transition-transform">
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                      </div>

                      {depositData.memo && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-rose-500 ml-2 italic">Mandatory Payment ID (MEMO)</label>
                          <div className="bg-rose-500/5 border border-rose-500/20 p-5 rounded-2xl flex items-center justify-between">
                            <span className="text-sm font-black tracking-widest text-white">{depositData.memo}</span>
                            <button onClick={() => copyToClipboard(depositData.memo)} className="p-2 text-rose-500"><Copy size={18} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="bank" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                  <div className="flex items-center gap-4 text-emerald-500">
                    <Building2 size={32} />
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Institutional Wire (SEPA/SWIFT)</h3>
                  </div>
                  <div className="p-8 bg-black border border-white/5 rounded-3xl space-y-6">
                    <p className="text-xs text-gray-400 leading-relaxed uppercase font-bold tracking-wider">
                      To inject capital via traditional banking, please initiate a transfer to our Zurich Custodial Node. 
                      Include your Client Reference ID to avoid settlement delays.
                    </p>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-white/5 pb-3">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Client Reference ID</span>
                        <span className="text-[10px] font-black text-emerald-500">TRUSTRA-{user._id.toString().slice(-6).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-3">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Processing Time</span>
                        <span className="text-[10px] font-black text-white">12 - 24 Hours</span>
                      </div>
                    </div>
                    <button className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
                      Download Wire Instructions (PDF)
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT: AUDIT INSTRUCTIONS ── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] space-y-6">
              <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                <Info size={16} className="text-emerald-500" /> Transfer Protocol
              </h4>
              <ul className="space-y-4">
                {[
                  "Assets are vaulted upon 2 blockchain confirmations.",
                  "Ensure you only send " + asset + " to this address.",
                  "Funds are auto-credited to your EUR principal.",
                  "Trustra does not charge fees for inbound liquidity."
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                    <span className="text-emerald-500">•</span> {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[2.5rem] flex gap-4">
              <AlertTriangle className="text-amber-500 shrink-0" size={24} />
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Network Warning</h5>
                <p className="text-[9px] text-amber-500/60 leading-relaxed uppercase font-bold">
                  Sending any asset other than {asset} or using an incompatible network will result in permanent capital loss. 
                  Audit your destination address carefully.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

