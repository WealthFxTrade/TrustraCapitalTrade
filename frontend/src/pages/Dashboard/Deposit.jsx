// src/pages/Dashboard/Deposit.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  Copy,
  Check,
  Loader2,
  Globe,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ShieldCheck,          // ← Added missing import
} from 'lucide-react';
import { motion } from 'framer-motion';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

export default function Deposit() {
  const { isAuthenticated } = useAuth();
  const [method, setMethod] = useState('crypto');
  const [asset, setAsset] = useState('USDT');
  const [depositData, setDepositData] = useState({ address: '', network: '' });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load the unique deposit address from backend
   */
  const loadDepositAddress = useCallback(async (showToast = false) => {
    if (!isAuthenticated || method !== 'crypto') return;

    setLoading(true);
    try {
      // ✅ FIXED: Proper API endpoint with query parameter
      const res = await api.get(`\( {API_ENDPOINTS.USER.DEPOSIT_ADDRESS}?asset= \){asset}`);

      if (res.data?.success) {
        setDepositData({
          address: res.data.address || '',
          network: res.data.network ||
            (asset === 'BTC' ? 'Bitcoin (Native)' :
             asset === 'ETH' ? 'Ethereum (ERC-20)' : 'TRC20 / ERC20'),
        });

        if (showToast) {
          toast.success('Deposit address refreshed successfully');
        }
      } else {
        toast.error('Failed to retrieve deposit address');
      }
    } catch (err) {
      console.error("Address Provision Error:", err);
      toast.error('Unable to connect to vault node. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, asset, method]);

  // Load address when component mounts or asset changes
  useEffect(() => {
    loadDepositAddress();
  }, [loadDepositAddress]);

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Address copied to clipboard!', { icon: '📋' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const handleRefreshAddress = async () => {
    setRefreshing(true);
    await loadDepositAddress(true);
  };

  const renderCryptoView = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-10"
    >
      {/* LEFT: QR Code & Address */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-[#0a0c10] border border-white/10 rounded-[40px] p-8 md:p-12 flex flex-col items-center">

          {/* Asset Selector */}
          <div className="flex gap-2 p-1.5 bg-black border border-white/5 rounded-2xl w-full max-w-md mb-10">
            {['USDT', 'BTC', 'ETH'].map((coin) => (
              <button
                key={coin}
                onClick={() => setAsset(coin)}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  asset === coin
                    ? 'bg-white text-black shadow'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {coin}
              </button>
            ))}
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-6 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.15)] mb-10">
            {loading ? (
              <div className="w-56 h-56 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
              </div>
            ) : depositData.address ? (
              <QRCodeSVG
                value={depositData.address}
                size={220}
                level="H"
                fgColor="#000"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-gray-400 text-sm">
                Generating secure address...
              </div>
            )}
          </div>

          {/* Address Box */}
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={13} className="text-emerald-500" />
                YOUR PERSONAL DEPOSIT ADDRESS
              </span>
              <span className="text-xs text-emerald-500 font-medium">
                {depositData.network}
              </span>
            </div>

            <div
              onClick={() => copyToClipboard(depositData.address)}
              className="group relative w-full bg-black border border-white/10 p-6 rounded-2xl cursor-pointer hover:border-emerald-500/60 transition-all"
            >
              <p className="text-sm font-mono text-white break-all pr-12 leading-relaxed">
                {depositData.address || 'Waiting for vault node...'}
              </p>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-emerald-500 transition">
                {copied ? <Check size={22} /> : <Copy size={22} />}
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefreshAddress}
              disabled={refreshing || loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-white/30 rounded-2xl transition disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              REFRESH ADDRESS
            </button>
          </div>
        </div>

        {/* Security Warning */}
        <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={22} />
          <div className="text-xs leading-relaxed text-amber-500/90">
            <strong>Important:</strong> Send only <span className="font-bold text-white">{asset}</span> on the{' '}
            <span className="font-bold text-white">{depositData.network}</span> network.
            Wrong network transfers are irreversible and will result in permanent loss of funds.
          </div>
        </div>
      </div>

      {/* RIGHT: Instructions */}
      <div className="lg:col-span-5">
        <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-8 sticky top-8">
          <h3 className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 flex items-center gap-3">
            <Globe size={18} /> HOW TO DEPOSIT
          </h3>

          <div className="space-y-8">
            {[
              { num: "1", title: "Send Funds", desc: `Transfer ${asset} from your wallet or exchange to the address above.` },
              { num: "2", title: "Wait for Confirmation", desc: "Blockchain watchers scan every 3–5 minutes. Minimum 3 confirmations required." },
              { num: "3", title: "Instant Crediting", desc: "Once confirmed, your Available EUR balance updates automatically." },
            ].map((step, i) => (
              <div key={i} className="flex gap-5">
                <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-white font-bold shrink-0">
                  {step.num}
                </div>
                <div>
                  <p className="font-semibold text-white">{step.title}</p>
                  <p className="text-sm text-gray-400 mt-1 leading-snug">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <a
              href="#"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition"
            >
              <ExternalLink size={15} /> View Transaction on Explorer
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderBankView = () => (
    <div className="p-12 bg-white/5 border border-white/10 rounded-[40px] text-center max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
        <Globe size={42} className="text-emerald-500" />
      </div>
      <h3 className="text-3xl font-black tracking-tight mb-4">SEPA / Bank Wire</h3>
      <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
        Bank transfers (SEPA) are available only for <span className="text-emerald-400 font-semibold">Tier III (Prime)</span> and higher users.
      </p>
      <p className="text-sm text-gray-500 mt-6">
        Please contact support or your dedicated account manager for personalized wire instructions.
      </p>
      <button className="mt-10 px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.1em] rounded-2xl hover:bg-gray-200 transition">
        Request Bank Details
      </button>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
            Capital <span className="text-emerald-500">Injection</span>
          </h1>
          <p className="text-emerald-500/70 text-sm font-medium mt-2">
            Add funds • Activate higher yield tiers
          </p>
        </div>

        {/* Method Toggle */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
          <button
            onClick={() => setMethod('crypto')}
            className={`px-9 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              method === 'crypto' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            CRYPTO
          </button>
          <button
            onClick={() => setMethod('bank')}
            className={`px-9 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              method === 'bank' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            BANK WIRE
          </button>
        </div>
      </div>

      {method === 'crypto' ? renderCryptoView() : renderBankView()}
    </div>
  );
}
