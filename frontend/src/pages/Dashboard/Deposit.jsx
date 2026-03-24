// src/pages/Dashboard/Deposit.jsx - CLEAN & FIXED VERSION

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

function SidebarLink({ to, icon: Icon, label, active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
        active
          ? 'bg-yellow-500 text-black shadow-xl shadow-yellow-500/20'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={18} className={active ? 'text-black' : 'text-gray-500 group-hover:text-white'} />
      <span className="text-[10px] font-black tracking-[0.2em] uppercase italic">{label}</span>
    </Link>
  );
}

function RequirementItem({ label, value, highlight = false }) {
  return (
    <li className="flex justify-between items-center border-b border-white/5 pb-3 last:border-none">
      <span className="text-[9px] font-bold uppercase text-white/40 tracking-widest">{label}</span>
      <span className={`text-[10px] font-black uppercase italic ${highlight ? 'text-yellow-400' : 'text-white'}`}>
        {value}
      </span>
    </li>
  );
}

export default function Deposit() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [asset, setAsset] = useState('BTC');
  const [depositAddress, setDepositAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Asset-specific deposit rules
  const assetRules = {
    BTC: {
      min: '0.0001 BTC',
      confirmations: '2–6 Blocks',
      network: 'Bitcoin Mainnet',
    },
    ETH: {
      min: '0.001 ETH',
      confirmations: '12–30 Confirmations',
      network: 'Ethereum Mainnet (ERC-20)',
    },
  };

  const loadDepositAddress = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/api/user/deposit-address?asset=${asset}`);

      if (res.data?.success && res.data?.address) {
        setDepositAddress(res.data.address);
        toast.success(`New ${asset} deposit address loaded`, { duration: 4000 });
      } else {
        throw new Error(res.data?.message || 'No deposit gateway available for this asset.');
      }
    } catch (err) {
      console.error('Deposit address fetch failed:', err);
      const msg = err.response?.data?.message ||
        (err.response?.status === 401 || err.response?.status === 403
          ? 'Session expired. Please sign in again.'
          : 'Network issue – please check your connection.');
      setError(msg);
      toast.error(msg, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  }, [user, asset]);

  useEffect(() => {
    loadDepositAddress();
  }, [loadDepositAddress]);

  const copyToClipboard = async () => {
    if (!depositAddress) return toast.error('No address available to copy');

    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      toast.success('Deposit address copied to clipboard', { icon: '📋', duration: 3000 });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy – please select manually');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020408] text-white font-sans selection:bg-yellow-500/20">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-black/50 backdrop-blur-xl p-8 hidden lg:flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-16 px-4">
          <div className="bg-yellow-500 p-2 rounded-xl text-black shadow-lg">
            <Zap size={22} fill="currentColor" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter uppercase">
            Trustra <span className="text-white/50 font-light">Vault</span>
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Terminal" />
          <SidebarLink to="/dashboard/deposit" icon={PlusCircle} label="Inbound" active />
          <SidebarLink to="/dashboard/withdrawal" icon={Repeat} label="Outbound" />
          <SidebarLink to="/dashboard/ledger" icon={History} label="Ledger" />
        </nav>

        <button
          onClick={logout}
          className="mt-auto flex items-center gap-4 px-5 py-4 text-gray-500 hover:text-rose-500 transition-colors group focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          aria-label="Sign out of session"
        >
          <LogOut size={18} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terminate Session</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 pt-28 lg:pt-32">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3 text-yellow-500/80">
                <Globe size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Zurich Secure Gateway • v2.5.3</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter leading-none">
                Deposit <span className="text-yellow-500">Assets</span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={asset}
                onChange={(e) => {
                  setAsset(e.target.value);
                  setDepositAddress(null);
                }}
                className="bg-black/60 border border-white/10 rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-yellow-500/50 transition-all disabled:opacity-50"
                aria-label="Select deposit asset"
                disabled={loading}
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
              </select>

              <button
                onClick={loadDepositAddress}
                disabled={loading}
                className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                aria-label="Refresh or generate new deposit address"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {loading ? 'Refreshing...' : 'Refresh Address'}
                </span>
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
            {/* LEFT: Guidelines & Warnings */}
            <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-md"
              >
                <h3 className="text-xs font-black uppercase tracking-widest text-yellow-500/70 mb-6 flex items-center gap-3">
                  <ShieldCheck size={16} /> Deposit Protocol Specs
                </h3>
                <ul className="space-y-5">
                  <RequirementItem label="Minimum Deposit" value={assetRules[asset]?.min || 'N/A'} highlight />
                  <RequirementItem label="Confirmations Required" value={assetRules[asset]?.confirmations || 'N/A'} />
                  <RequirementItem label="Supported Network" value={assetRules[asset]?.network || 'N/A'} highlight />
                  <RequirementItem label="Expected Processing" value="Instant after confirmation" />
                  <RequirementItem label="Fees" value="Network gas only (no platform fee)" />
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-8 bg-rose-900/10 border border-rose-700/30 rounded-[2.5rem] backdrop-blur-md"
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="text-rose-500 shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="text-sm font-black uppercase text-rose-400 mb-3">Critical Security Notice</h4>
                    <p className="text-[10px] leading-relaxed text-rose-300/90">
                      Send <strong>only {asset}</strong> to this address. Sending any other asset or using the wrong network will result in <strong>permanent loss</strong> of funds. Always double-check the address before sending.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT: Address & QR Code */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0A0C10] border border-white/8 rounded-[3rem] p-10 lg:p-12 backdrop-blur-xl relative overflow-hidden shadow-2xl group"
              >
                <div className="absolute top-0 right-0 p-10 opacity-[0.04]">
                  <ShieldCheck size={140} className="text-yellow-500" />
                </div>

                {loading ? (
                  <div className="py-32 flex flex-col items-center gap-8">
                    <Loader2 size={48} className="text-yellow-500 animate-spin" />
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.6em] text-yellow-500/40 mb-2">Initializing Secure Vault Node</p>
                      <p className="text-gray-600 text-sm">Please wait...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="py-32 text-center space-y-8">
                    <AlertCircle size={64} className="text-rose-500 mx-auto" />
                    <p className="text-lg font-bold text-rose-300">{error}</p>
                    <button
                      onClick={loadDepositAddress}
                      className="px-10 py-5 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-700 rounded-2xl text-rose-200 font-black uppercase text-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : depositAddress ? (
                  <div className="space-y-10">
                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-yellow-900/30 transform group-hover:scale-105 transition-transform duration-500">
                        <QRCodeSVG
                          value={depositAddress}
                          size={240}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                    </div>

                    {/* Address Display */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Your Unique {asset} Deposit Address</p>
                      <div
                        onClick={copyToClipboard}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && copyToClipboard()}
                        className="w-full bg-black/60 border border-white/10 p-6 rounded-2xl flex items-center justify-between cursor-pointer group/copy hover:border-yellow-500/40 transition-all active:scale-[0.98]"
                        aria-label="Click to copy deposit address to clipboard"
                      >
                        <span className="font-mono text-sm text-yellow-400 break-all select-all pr-6">
                          {depositAddress}
                        </span>
                        {copied ? (
                          <Check size={24} className="text-green-500 flex-shrink-0" />
                        ) : (
                          <Copy size={24} className="text-white/30 group-hover/copy:text-yellow-400 transition-colors flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex justify-center items-center gap-4 py-5 px-8 bg-white/5 rounded-full border border-white/10">
                      <ShieldCheck className="text-emerald-500" size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80">
                        Zurich Vault • End-to-End Encrypted • SSL/TLS 1.3
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-32 text-center">
                    <p className="text-lg text-gray-400">No deposit address available at this time.</p>
                    <button
                      onClick={loadDepositAddress}
                      className="mt-6 px-10 py-5 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/30 rounded-2xl text-yellow-300 font-black uppercase text-sm transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                    >
                      Generate Address
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex justify-center mt-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 px-10 py-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-gray-300 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            >
              <ChevronLeft size={18} /> Return to Terminal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
