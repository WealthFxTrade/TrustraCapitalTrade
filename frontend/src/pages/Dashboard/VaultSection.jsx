// src/pages/Dashboard/VaultSection.jsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ShieldCheck, Zap, QrCode, X, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function VaultSection() {
  const [addresses, setAddresses] = useState({ BTC: '', ETH: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState('');
  const [activeQR, setActiveQR] = useState(null); // 'BTC' or 'ETH'

  // Fetch vault addresses from backend
  const fetchVaultAddresses = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/user/vault-addresses');
      setAddresses({
        BTC: res.data.addresses?.BTC || '',
        ETH: res.data.addresses?.ETH || '',
      });
      toast.success('Vault addresses refreshed');
    } catch (err) {
      console.error('Failed to fetch vault addresses:', err);
      const msg = getErrorMessage(err);
      toast.error(msg, { duration: 5000 });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultAddresses();
  }, []);

  // Copy address to clipboard
  const copyToClipboard = (text, type) => {
    if (!text) return toast.error('No address available to copy');

    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type} address copied!`);
    setTimeout(() => setCopied(''), 2000);
  };

  // Better error messages (no vague fallbacks)
  const getErrorMessage = (err) => {
    if (err.response?.data?.message) return err.response.data.message;

    const status = err.response?.status;

    if (status === 401 || status === 403) {
      return 'Session expired. Please login again.';
    }
    if (!err.response && err.request) {
      return 'Cannot reach server. Check your internet connection.';
    }
    if (status >= 500) {
      return 'Server temporarily unavailable. Please try again later.';
    }
    return err.message || 'Failed to load vault addresses.';
  };

  return (
    <section className="mt-12 relative">
      {/* QR Modal Overlay */}
      {activeQR && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#020408]/90 backdrop-blur-xl">
          <div className="bg-[#0a0c10] border border-white/10 p-10 rounded-[3rem] max-w-sm w-full text-center relative shadow-[0_0_100px_rgba(234,179,8,0.1)]">
            <button
              onClick={() => setActiveQR(null)}
              className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-all"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">
              Scan {activeQR} Node
            </h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-8">
              Protocol V8.6 Direct Sync
            </p>

            <div className="bg-white p-4 rounded-3xl inline-block mb-8 shadow-xl">
              <QRCodeSVG
                value={activeQR === 'BTC' ? addresses.BTC : addresses.ETH}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-6">
              <code className="text-[10px] font-mono text-yellow-500 break-all">
                {activeQR === 'BTC' ? addresses.BTC : addresses.ETH}
              </code>
            </div>

            <button
              onClick={() => copyToClipboard(activeQR === 'BTC' ? addresses.BTC : addresses.ETH, activeQR)}
              disabled={!addresses[activeQR]}
              className={`w-full py-4 font-black uppercase italic rounded-xl flex items-center justify-center gap-3 transition-all ${
                addresses[activeQR]
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Copy size={16} /> Copy Address
            </button>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-white/5" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/50 italic">
          Personal Liquidity Vault
        </h2>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/40 border border-red-800 text-red-200 p-6 rounded-2xl mb-8 flex items-start gap-4">
          <AlertCircle size={24} className="mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold mb-1">Vault Error</h3>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchVaultAddresses}
              disabled={loading}
              className="mt-4 px-5 py-2 bg-red-800/50 hover:bg-red-700 rounded-lg text-sm transition flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw size={16} />}
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Vault Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {['BTC', 'ETH'].map((coin) => (
          <div
            key={coin}
            className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] group hover:border-yellow-500/20 transition-all duration-500 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-white/5 ${coin === 'BTC' ? 'text-orange-500' : 'text-blue-500'}`}>
                    <Zap size={18} />
                  </div>
                  <span className="font-black italic uppercase tracking-tighter text-xl">
                    {coin} Network
                  </span>
                </div>

                <button
                  onClick={() => setActiveQR(coin)}
                  disabled={loading || !addresses[coin]}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                    addresses[coin]
                      ? 'bg-white/5 hover:bg-white/10 border-white/5 text-yellow-500'
                      : 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <QrCode size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Show QR</span>
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Unique Deposit Address
                </p>

                <div className="flex items-center gap-3 bg-black/40 p-5 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all">
                  {loading ? (
                    <div className="flex items-center gap-3 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Allocating Protocol...</span>
                    </div>
                  ) : (
                    <>
                      <code className="text-[11px] font-mono text-yellow-500/80 truncate flex-1 break-all">
                        {addresses[coin] || 'No address available'}
                      </code>

                      <button
                        onClick={() => copyToClipboard(addresses[coin], coin)}
                        disabled={!addresses[coin]}
                        className={`p-3 rounded-xl transition-all ${
                          addresses[coin]
                            ? 'bg-white/5 hover:bg-yellow-500 hover:text-black'
                            : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {copied === coin ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                <ShieldCheck size={14} />
                <span>Encrypted via AES-256 Protocol</span>
              </div>
            </div>

            {/* Decorative coin symbol */}
            <span className="absolute -right-4 -bottom-8 text-[120px] font-black italic opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-all">
              {coin}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
