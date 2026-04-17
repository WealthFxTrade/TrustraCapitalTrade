// frontend/src/pages/Dashboard/Deposit.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  Copy, Check, Loader2, Globe, Info,
  ShieldCheck, AlertCircle, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

export default function Deposit() {
  const { isAuthenticated } = useAuth();
  const [method, setMethod] = useState('crypto');
  const [asset, setAsset] = useState('USDT');
  const [depositData, setDepositData] = useState({ address: '', network: '' });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Load the unique institutional deposit address from backend
   */
  const loadDepositAddress = useCallback(async () => {
    if (!isAuthenticated || method !== 'crypto') return;

    setLoading(true);
    try {
      // Calls userController.getDepositAddress
      const res = await api.get(`${API_ENDPOINTS.USER.DEPOSIT_ADDRESS}?asset=${asset}`);

      if (res.data?.success) {
        setDepositData({
          address: res.data.address || '',
          network: res.data.network || (asset === 'BTC' ? 'Bitcoin (Native)' : 'Ethereum (ERC-20)')
        });
      }
    } catch (err) {
      console.error("Address Provision Error:", err);
      toast.error('Vault node rejected the request. Try again later.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, asset, method]);

  useEffect(() => {
    loadDepositAddress();
  }, [loadDepositAddress]);

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const renderCryptoView = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-10"
    >
      {/* LEFT: QR & Address */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-[#0a0c10] border border-white/10 rounded-[40px] p-8 md:p-12 flex flex-col items-center">
          
          {/* Asset Tabs */}
          <div className="flex gap-2 p-1.5 bg-black border border-white/5 rounded-2xl w-full mb-10">
            {['USDT', 'BTC', 'ETH'].map((coin) => (
              <button
                key={coin}
                onClick={() => setAsset(coin)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  asset === coin ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
                }`}
              >
                {coin}
              </button>
            ))}
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.1)] mb-10">
            {loading ? (
              <div className="w-52 h-52 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
              </div>
            ) : depositData.address ? (
              <QRCodeSVG value={depositData.address} size={200} level="H" />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-gray-400 italic text-xs">
                Generating Address...
              </div>
            )}
          </div>

          {/* Address Display */}
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500" /> Personal Vault Address
              </span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                {depositData.network}
              </span>
            </div>

            <div 
              onClick={() => copyToClipboard(depositData.address)}
              className="group relative w-full bg-black border border-white/10 p-6 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition-all overflow-hidden"
            >
              <p className="text-sm font-mono text-white break-all pr-10">
                {depositData.address || 'Provisioning node...'}
              </p>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-emerald-500 transition-colors">
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </div>
            </div>
          </div>
        </div>

        {/* Security Warning */}
        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4">
          <AlertCircle className="text-amber-500 shrink-0" size={20} />
          <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
            Strict Policy: Only send <span className="font-black underline">{asset}</span> via the <span className="font-black underline">{depositData.network}</span> network. Assets sent via other protocols (like BSC or Polygon) are non-recoverable.
          </p>
        </div>
      </div>

      {/* RIGHT: Status & Info */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-8">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-3">
            <Globe size={16} /> Injection Status
          </h3>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs">1</div>
              <div>
                <p className="text-sm font-bold text-white">Transfer Funds</p>
                <p className="text-xs text-gray-500 mt-1">Send your {asset} from your private wallet or exchange.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">2</div>
              <div>
                <p className="text-sm font-bold text-white">Node Synchronization</p>
                <p className="text-xs text-gray-500 mt-1">Our watchers scan the blockchain every 5 minutes for new blocks.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 font-bold text-xs">3</div>
              <div>
                <p className="text-sm font-bold text-white">Automatic Crediting</p>
                <p className="text-xs text-gray-500 mt-1">Once confirmed (3 blocks), your EUR balance updates instantly.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all">
              <ExternalLink size={14} /> View Explorer
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderBankView = () => (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-12 bg-white/5 border border-white/10 rounded-[40px] text-center"
    >
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
        <Info size={40} />
      </div>
      <h3 className="text-2xl font-black tracking-tight mb-4">SEPA Wire Transfer</h3>
      <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed mb-8">
        Institutional SEPA transfers are reserved for <span className="text-white font-bold">Tier III</span> users and above. Please contact your account manager for wire instructions.
      </p>
      <button className="px-8 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl">
        Request Access
      </button>
    </motion.div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
            Capital <span className="text-emerald-500">Injection</span>
          </h1>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">
            Syncing with node {depositData.address.slice(0, 8)}...
          </p>
        </div>

        {/* Toggle */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
          <button
            onClick={() => setMethod('crypto')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              method === 'crypto' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Crypto
          </button>
          <button
            onClick={() => setMethod('bank')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              method === 'bank' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Bank
          </button>
        </div>
      </div>

      {method === 'crypto' ? renderCryptoView() : renderBankView()}
    </div>
  );
}

