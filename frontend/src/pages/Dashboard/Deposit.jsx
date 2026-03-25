// src/pages/Dashboard/Deposit.jsx - FULLY CORRECTED & UNSHORTENED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  Zap,
  PlusCircle,
  History,
  Repeat,
  LogOut,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function Deposit() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [asset, setAsset] = useState('BTC');
  const [depositAddress, setDepositAddress] = useState(null);
  const [minDeposit, setMinDeposit] = useState('0.0001');
  const [confirmations, setConfirmations] = useState('6');
  const [network, setNetwork] = useState('Bitcoin Mainnet (SegWit)');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadDepositAddress = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/api/user/deposit-address?asset=${asset}`);

      if (res.data?.success && res.data?.address) {
        setDepositAddress(res.data.address);
        setMinDeposit(res.data.minDeposit || '0.0001');
        setConfirmations(res.data.confirmations || '6');
        setNetwork(res.data.network || 'Bitcoin Mainnet (SegWit)');

        toast.success(`✅ ${asset} deposit address loaded successfully`, { duration: 4000 });
      } else {
        throw new Error(res.data?.message || 'Failed to generate deposit address');
      }
    } catch (err) {
      console.error('[DEPOSIT ADDRESS ERROR]', err);
      const msg = err.response?.data?.message || 
                 err.message || 
                 'Failed to connect to deposit gateway. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [user, asset]);

  useEffect(() => {
    loadDepositAddress();
  }, [loadDepositAddress]);

  const copyToClipboard = async () => {
    if (!depositAddress) return;

    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      toast.success('Address copied to clipboard!', { icon: '📋' });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy address');
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
          <a href="/dashboard" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
            <PlusCircle size={18} /> Terminal
          </a>
          <a href="/dashboard/deposit" className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-yellow-500 text-black shadow-xl shadow-yellow-500/20">
            <PlusCircle size={18} className="text-black" /> Inbound
          </a>
          <a href="/dashboard/withdrawal" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
            <Repeat size={18} /> Outbound
          </a>
          <a href="/dashboard/ledger" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
            <History size={18} /> Ledger
          </a>
        </nav>

        <button
          onClick={logout}
          className="mt-auto flex items-center gap-4 px-5 py-4 text-gray-500 hover:text-rose-500 transition-all"
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

            <button
              onClick={loadDepositAddress}
              disabled={loading}
              className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {loading ? 'Generating...' : 'Refresh Address'}
              </span>
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
            {/* Left: Protocol Specs & Warnings */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem]"
              >
                <h3 className="text-xs font-black uppercase tracking-widest text-yellow-500 mb-6 flex items-center gap-3">
                  <ShieldCheck size={18} /> Deposit Protocol Specs
                </h3>
                <ul className="space-y-6 text-sm">
                  <li className="flex justify-between border-b border-white/5 pb-4">
                    <span className="text-gray-400">Minimum Deposit</span>
                    <span className="font-black text-yellow-400">{minDeposit} {asset}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-4">
                    <span className="text-gray-400">Confirmations Required</span>
                    <span className="font-black">{confirmations}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-4">
                    <span className="text-gray-400">Supported Network</span>
                    <span className="font-black text-emerald-400">{network}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Fees</span>
                    <span className="font-black">Network only (no platform fee)</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-rose-900/10 border border-rose-700/30 rounded-[2.5rem]"
              >
                <div className="flex gap-4">
                  <AlertTriangle className="text-rose-500 mt-1" size={24} />
                  <div>
                    <h4 className="font-black text-rose-400 mb-2">CRITICAL SECURITY NOTICE</h4>
                    <p className="text-sm text-rose-300/90 leading-relaxed">
                      Send <strong>ONLY {asset}</strong> to this address.<br />
                      Wrong asset or network = <strong>permanent loss</strong> of funds.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: QR + Address */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0A0C10] border border-white/8 rounded-[3rem] p-10 lg:p-14 relative overflow-hidden"
              >
                {loading ? (
                  <div className="py-32 flex flex-col items-center justify-center gap-6">
                    <Loader2 size={56} className="text-yellow-500 animate-spin" />
                    <p className="text-yellow-500/70 font-black uppercase tracking-widest text-sm">
                      Generating secure deposit address...
                    </p>
                  </div>
                ) : error ? (
                  <div className="py-32 text-center">
                    <AlertTriangle size={64} className="text-rose-500 mx-auto mb-6" />
                    <p className="text-rose-400 text-xl mb-8">{error}</p>
                    <button
                      onClick={loadDepositAddress}
                      className="px-12 py-5 bg-rose-600 hover:bg-rose-500 rounded-2xl font-black uppercase tracking-widest"
                    >
                      Retry
                    </button>
                  </div>
                ) : depositAddress ? (
                  <div className="space-y-12">
                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="bg-white p-8 rounded-3xl shadow-2xl">
                        <QRCodeSVG
                          value={depositAddress}
                          size={260}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="H"
                        />
                      </div>
                    </div>

                    {/* Address Box */}
                    <div className="space-y-4">
                      <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                        YOUR UNIQUE {asset} DEPOSIT ADDRESS
                      </p>

                      <div
                        onClick={copyToClipboard}
                        className="w-full bg-black/70 border border-white/10 p-6 rounded-2xl flex items-center justify-between cursor-pointer hover:border-yellow-500/50 transition-all active:scale-[0.985]"
                      >
                        <span className="font-mono text-yellow-400 break-all pr-8 text-sm select-all">
                          {depositAddress}
                        </span>
                        {copied ? (
                          <Check className="text-emerald-500" size={28} />
                        ) : (
                          <Copy className="text-white/40 hover:text-white" size={28} />
                        )}
                      </div>
                    </div>

                    {/* Security Footer */}
                    <div className="flex items-center justify-center gap-4 py-6 border-t border-white/10">
                      <ShieldCheck className="text-emerald-500" size={22} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        Zurich Vault • End-to-End Encrypted • SSL/TLS 1.3
                      </span>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </div>
          </div>

          {/* Return Button */}
          <div className="flex justify-center mt-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 px-12 py-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-gray-300 hover:text-white transition-all"
            >
              <ChevronLeft size={20} /> Return to Terminal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
