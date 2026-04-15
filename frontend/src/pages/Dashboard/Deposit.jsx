// src/pages/Dashboard/Deposit.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  Copy, Check, Loader2, AlertTriangle, Globe, Info, 
  ArrowDownLeft, Landmark, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

export default function Deposit({ refreshBalances }) {
  const { isAuthenticated } = useAuth();
  const [method, setMethod] = useState('crypto');
  const [asset, setAsset] = useState('USDT');
  const [depositData, setDepositData] = useState({ address: '', memo: '' });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Fetches the institutional deposit address from the backend.
   */
  const loadDepositAddress = useCallback(async () => {
    if (!isAuthenticated || method !== 'crypto') return;

    setLoading(true);
    try {
      // Append asset to query string to match backend requirements
      const response = await api.get(`${API_ENDPOINTS.USER.DEPOSIT_ADDRESS}?asset=${asset}`);

      if (response.data?.success) {
        setDepositData({
          address: response.data.address,
          memo: response.data.memo || ''
        });
      }
    } catch (err) {
      console.error("Vault Sync Error:", err);
      toast.error('Node Sync Failed: Asset Ledger Offline');
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
      toast.success('Address Copied to Secure Clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Clipboard Access Denied');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Capital Injection</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Node Security: AES-256 Encrypted Tunnel</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
          <Globe size={12} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Global Liquidity Pool Active</span>
        </div>
      </div>

      {/* Payment Method Switcher */}
      <div className="flex p-1.5 bg-black/40 border border-white/5 rounded-2xl max-w-sm">
        {['crypto', 'bank'].map((type) => (
          <button
            key={type}
            onClick={() => setMethod(type)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              method === type ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-white'
            }`}
          >
            {type === 'crypto' ? 'Digital Assets' : 'Fiat Wire'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {method === 'crypto' ? (
              <motion.div 
                key="crypto" 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="bg-black/20 border border-white/5 rounded-[2.5rem] p-8 md:p-12 flex flex-col items-center gap-8 relative overflow-hidden">
                  
                  {/* QR Code Canvas */}
                  <div className="bg-white p-6 rounded-[2rem] shadow-2xl relative z-10">
                    {loading ? (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-xl">
                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                      </div>
                    ) : (
                      <QRCodeSVG value={depositData.address || "Trustra"} size={192} level="H" />
                    )}
                  </div>

                  {/* Asset Selector */}
                  <div className="flex gap-2 w-full max-w-md">
                    {['USDT', 'BTC', 'ETH'].map((coin) => (
                      <button
                        key={coin}
                        onClick={() => setAsset(coin)}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          asset === coin ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'border-white/5 text-gray-500 hover:border-white/20'
                        }`}
                      >
                        {coin}
                      </button>
                    ))}
                  </div>

                  <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Public Vault Address ({asset})</label>
                      <div className="group relative">
                        <div className="bg-black border border-white/5 px-6 py-5 rounded-2xl font-mono text-xs text-gray-300 break-all pr-16 group-hover:border-emerald-500/50 transition-all">
                          {loading ? "Generating node address..." : (depositData.address || "Fetching address...")}
                        </div>
                        <button
                          onClick={() => copyToClipboard(depositData.address)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-xl transition-all"
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-2xl flex gap-4">
                  <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                  <p className="text-[10px] text-amber-200/70 font-medium leading-relaxed uppercase tracking-wider">
                    Deposits require 3 network confirmations. Ensure you are sending <span className="text-amber-500 font-bold">{asset}</span>. 
                    Sending any other asset to this address will result in permanent loss of funds.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="bank" 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="bg-black/20 border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                  <div className="flex items-center gap-4 text-emerald-500">
                    <Landmark size={32} />
                    <h3 className="text-lg font-black uppercase italic tracking-tighter">SWIFT / SEPA Transfer</h3>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Institutional wire transfers are available for amounts exceeding <span className="text-white font-bold">€10,000</span>. 
                      Please contact your account manager to initiate a bank-to-node transfer.
                    </p>
                    <button className="w-full py-5 bg-emerald-600 hover:bg-emerald-400 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                      Request Institutional Invoice
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" /> Security Protocol
            </h4>
            <ul className="space-y-4">
              {[
                { title: 'Cold Storage', desc: '98% of assets are held in air-gapped multisig vaults.' },
                { title: 'Instant Detection', desc: 'Node auto-syncs balance upon network confirmation.' },
                { title: 'Privacy Shield', desc: 'Transactions are obfuscated through our liquidity relay.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <Check size={12} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase italic">{item.title}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] flex gap-4">
            <Info className="text-blue-500 shrink-0" size={20} />
            <p className="text-[10px] text-blue-300/60 font-medium leading-relaxed uppercase tracking-wider">
              Need assistance? Our institutional desk is available 24/7 for large capital injections via secure channel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

