import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  Copy,
  Check,
  Loader2,
  Globe,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

export default function Deposit() {
  const { isAuthenticated } = useAuth();
  const [asset, setAsset] = useState('USDT');
  const [depositData, setDepositData] = useState({ address: '', network: '' });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDepositAddress = useCallback(async (showToast = false) => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      // ✅ CORRECTED: Clean template literal without escaped characters
      const res = await api.get(`${API_ENDPOINTS.USER.DEPOSIT_ADDRESS}?asset=${asset}`);

      if (res.data?.success) {
        setDepositData({
          address: res.data.address || '',
          network: res.data.network ||
            (asset === 'BTC' ? 'Bitcoin (Native)' :
             asset === 'ETH' ? 'Ethereum (ERC-20)' : 'TRC20 / ERC20'),
        });
        if (showToast) toast.success('Deposit address refreshed successfully');
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
  }, [isAuthenticated, asset]);

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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-[#0a0c10] border border-white/10 rounded-[40px] p-8 md:p-12 flex flex-col items-center">
          <div className="flex gap-2 p-1.5 bg-black border border-white/5 rounded-2xl w-full max-w-md mb-10">
            {['USDT', 'BTC', 'ETH'].map((coin) => (
              <button
                key={coin}
                onClick={() => setAsset(coin)}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  asset === coin ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
                }`}
              >
                {coin}
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl mb-10">
            {loading ? (
              <div className="w-56 h-56 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
              </div>
            ) : (
              <QRCodeSVG value={depositData.address || 'Generating...'} size={220} level="H" />
            )}
          </div>

          <div className="w-full space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={13} className="text-emerald-500" />
                YOUR PERSONAL DEPOSIT ADDRESS
              </span>
            </div>
            <div onClick={() => copyToClipboard(depositData.address)} className="group relative w-full bg-black border border-white/10 p-6 rounded-2xl cursor-pointer">
              <p className="text-sm font-mono text-white break-all pr-12">
                {depositData.address || 'Waiting for vault node...'}
              </p>
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                {copied ? <Check size={22} className="text-emerald-500" /> : <Copy size={22} className="text-gray-500" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

