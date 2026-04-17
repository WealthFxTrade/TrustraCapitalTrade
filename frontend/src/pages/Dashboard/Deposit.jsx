import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  Copy, Check, Loader2, AlertTriangle, Globe, Info,
  ShieldCheck, PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

export default function Deposit({ refreshBalances }) {
  const { isAuthenticated } = useAuth();
  const [method, setMethod] = useState('crypto');
  const [asset, setAsset] = useState('USDT');
  const [depositData, setDepositData] = useState({ address: '' });
  const [expectedAmount, setExpectedAmount] = useState(''); // New: Deposit amount input
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Load institutional deposit address from backend
   */
  const loadDepositAddress = useCallback(async () => {
    if (!isAuthenticated || method !== 'crypto') return;

    setLoading(true);
    try {
      const response = await api.get(`\( {API_ENDPOINTS.USER.DEPOSIT_ADDRESS}?asset= \){asset}`);

      if (response.data?.success) {
        setDepositData({
          address: response.data.address || '',
        });
      } else {
        toast.error('Failed to load deposit address');
      }
    } catch (err) {
      console.error("Deposit address error:", err);
      toast.error('Unable to fetch deposit address. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, asset, method]);

  // Load address when asset or method changes
  useEffect(() => {
    loadDepositAddress();
  }, [loadDepositAddress]);

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Address copied successfully');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  // Optional: Handle amount change (you can later send this to backend if needed)
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setExpectedAmount(value);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Capital Injection</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
            Secure deposit to institutional vault node
          </p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <Globe size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Global Liquidity Pool Active</span>
        </div>
      </div>

      {/* Method Switcher */}
      <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl max-w-sm mx-auto md:mx-0">
        {['crypto', 'bank'].map((type) => (
          <button
            key={type}
            onClick={() => setMethod(type)}
            className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              method === type 
                ? 'bg-emerald-500 text-black shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {type === 'crypto' ? 'Cryptocurrency' : 'Bank Wire (SEPA)'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Deposit Area */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {method === 'crypto' ? (
              <motion.div
                key="crypto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-10 md:p-14 flex flex-col items-center">

                  {/* QR Code */}
                  <div className="bg-white p-5 rounded-2xl shadow-2xl mb-10">
                    {loading ? (
                      <div className="w-56 h-56 flex items-center justify-center">
                        <Loader2 className="animate-spin text-emerald-500" size={48} />
                      </div>
                    ) : depositData.address ? (
                      <QRCodeSVG 
                        value={depositData.address} 
                        size={220} 
                        level="H" 
                        fgColor="#000000"
                      />
                    ) : (
                      <div className="w-56 h-56 flex items-center justify-center text-gray-400">
                        Address unavailable
                      </div>
                    )}
                  </div>

                  {/* Asset Selector */}
                  <div className="flex gap-3 w-full max-w-md mb-8">
                    {['USDT', 'BTC', 'ETH'].map((coin) => (
                      <button
                        key={coin}
                        onClick={() => setAsset(coin)}
                        className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                          asset === coin 
                            ? 'bg-emerald-500 border-emerald-500 text-black' 
                            : 'border-white/10 text-gray-400 hover:border-white/30'
                        }`}
                      >
                        {coin}
                      </button>
                    ))}
                  </div>

                  {/* New: Expected Deposit Amount Input */}
                  <div className="w-full max-w-lg mb-8">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 block flex items-center gap-2">
                      <PlusCircle size={14} /> Expected Deposit Amount (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={expectedAmount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        className="w-full bg-black border border-white/10 p-6 rounded-2xl text-2xl font-black focus:border-emerald-500 outline-none transition-colors pr-20"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-600">
                        {asset === 'BTC' ? 'BTC' : 'EUR'}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">
                      This is for your reference only. It helps track incoming deposits.
                    </p>
                  </div>

                  {/* Address Display */}
                  <div className="w-full max-w-lg">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 block">
                      {asset} Deposit Address
                    </label>
                    <div className="relative group">
                      <div className="bg-black border border-white/10 p-6 rounded-2xl font-mono text-sm break-all text-gray-300 min-h-[110px] flex items-center">
                        {loading 
                          ? "Generating secure vault address..." 
                          : depositData.address || "No address available"}
                      </div>
                      {depositData.address && (
                        <button
                          onClick={() => copyToClipboard(depositData.address)}
                          className="absolute right-4 top-4 p-3 bg-white/10 hover:bg-emerald-500 hover:text-black rounded-xl transition-all"
                        >
                          {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-3xl flex gap-5">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={24} />
                  <p className="text-sm text-amber-400/80 leading-relaxed">
                    Send only <span className="font-bold text-amber-400">{asset}</span> to this address. 
                    Sending any other asset will result in permanent loss of funds. 
                    Minimum 3 network confirmations required.
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Bank Wire Section - unchanged */
              <motion.div
                key="bank"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0c10] border border-white/10 rounded-3xl p-12 space-y-8"
              >
                <div className="flex items-center gap-4 text-emerald-500">
                  <ShieldCheck size={36} />
                  <h3 className="text-2xl font-black tracking-tighter">SEPA / SWIFT Wire Transfer</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  For large institutional deposits (€10,000+), bank wire transfers are available. 
                  Please contact your dedicated account manager to receive personalized wire instructions.
                </p>
                <button className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
                  Request Wire Instructions
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar - unchanged but slightly refined */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-10 bg-white/5 border border-white/10 rounded-3xl space-y-8">
            <h4 className="flex items-center gap-3 text-emerald-500 text-xs font-black uppercase tracking-widest">
              <ShieldCheck size={18} /> Security Features
            </h4>
            <ul className="space-y-6 text-sm">
              {[
                { title: 'Cold Storage Protection', desc: '98% of assets held in offline multisig vaults' },
                { title: 'Real-time Confirmation', desc: 'Balance updates automatically upon network confirmation' },
                { title: 'Address Whitelisting', desc: 'All deposit addresses are deterministically derived' }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="mt-1 h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
            <div className="flex gap-4">
              <Info className="text-blue-400 mt-1" size={22} />
              <p className="text-xs leading-relaxed text-blue-300/70">
                Need help with a large deposit? Our institutional support team is available 24/7 via secure channel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
