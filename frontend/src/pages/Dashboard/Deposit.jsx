// src/pages/Dashboard/Deposit.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  RefreshCw, // PRODUCTION FIX: Added missing explicit icon import to prevent runtime reference crashes
} from 'lucide-react';
import { motion } from 'framer-motion';
import api, { API_ENDPOINTS } from '@/api/api';
import { useAuth } from '@/context/AuthContext';

export default function Deposit() {
  const { isAuthenticated } = useAuth();

  const [asset, setAsset] = useState('USDT');
  const [depositData, setDepositData] = useState({ address: '', network: '' });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load deposit address
  const loadDepositAddress = useCallback(async (showToast = false) => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      // PRODUCTION FIX: Corrected malformed template literal syntax string block
      const res = await api.get(`${API_ENDPOINTS.USER.DEPOSIT_ADDRESS}?asset=${asset}`);

      if (res.data?.success) {
        setDepositData({
          address: res.data.address || '',
          network: res.data.network ||
            (asset === 'BTC' ? 'Bitcoin Network' :
             asset === 'ETH' ? 'Ethereum (ERC-20)' : 'TRC20 / ERC20'),
        });

        if (showToast) {
          toast.success('Deposit address refreshed successfully');
        }
      } else {
        toast.error(res.data?.message || 'Failed to retrieve deposit address');
      }
    } catch (err) {
      console.error("Deposit Address Error:", err);
      toast.error('Unable to connect to vault. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, asset]);

  // Load address when component mounts or asset changes
  useEffect(() => {
    loadDepositAddress();
  }, [loadDepositAddress]);

  const copyToClipboard = async (text) => {
    if (!text) {
      toast.error("No address to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Address copied to clipboard!', { icon: '📋' });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDepositAddress(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="bg-[#0a0c10] border border-white/10 rounded-[40px] p-8 md:p-12">
        <div className="flex flex-col items-center">

          {/* Asset Selector */}
          <div className="flex gap-2 p-1.5 bg-black border border-white/5 rounded-2xl w-full max-w-md mb-10">
            {['USDT', 'BTC', 'ETH'].map((coin) => (
              <button
                key={coin}
                onClick={() => setAsset(coin)}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  asset === coin
                    ? 'bg-white text-black shadow-lg'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {coin}
              </button>
            ))}
          </div>

          {/* QR Code */}
          <div className="bg-white p-6 rounded-3xl mb-10 shadow-inner">
            {loading ? (
              <div className="w-56 h-56 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
              </div>
            ) : (
              <QRCodeSVG
                value={depositData.address || "Generating address..."}
                size={220}
                level="H"
                includeMargin={true}
              />
            )}
          </div>

          {/* Address Display */}
          <div className="w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                YOUR PERSONAL {asset} DEPOSIT ADDRESS
              </span>

              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="text-emerald-500 hover:text-emerald-400 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>

            <div
              onClick={() => copyToClipboard(depositData.address)}
              className="group relative w-full bg-black border border-white/10 p-6 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition-all active:scale-[0.985]"
            >
              <p className="text-sm font-mono text-white break-all pr-12 leading-relaxed">
                {depositData.address || 'Waiting for vault node...'}
              </p>

              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                {copied ? (
                  <Check size={22} className="text-emerald-500" />
                ) : (
                  <Copy size={22} className="text-gray-500 group-hover:text-gray-300" />
                )}
              </div>
            </div>

            {depositData.network && (
              <p className="text-center text-xs text-gray-500 mt-3">
                Network: <span className="text-gray-400 font-medium">{depositData.network}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-8 text-center text-[10px] text-gray-500 max-w-md mx-auto">
        Only send {asset} to this address. Sending any other asset may result in permanent loss of funds.
      </div>
    </motion.div>
  );
}

