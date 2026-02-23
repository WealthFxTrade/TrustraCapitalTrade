import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, RefreshCw, ShieldAlert, Wifi, WifiOff } from 'lucide-react';
import api from '../api/api';

export default function DepositTab() {
  const assets = ['BTC', 'ETH', 'USDT'];
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchAddress = async (fresh = false, retryCount = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/wallet/address/${selectedAsset}`, {
        params: { fresh }
      });
      // Response normalization
      const addr = res.data.address || res.data;
      if (!addr) throw new Error('Gateway initialization failed');
      setAddress(addr);
    } catch (err) {
      if (retryCount > 0) {
        setTimeout(() => fetchAddress(fresh, retryCount - 1), 1500);
      } else {
        setError(err.response?.data?.message || `Failed to sync ${selectedAsset} node`);
        setAddress('');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, [selectedAsset]);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Asset Selector */}
      <div className="flex gap-2 p-1 bg-slate-950/50 rounded-xl border border-slate-800">
        {assets.map((asset) => (
          <button
            key={asset}
            onClick={() => setSelectedAsset(asset)}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedAsset === asset 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-300 disabled:opacity-50'
            }`}
          >
            {asset}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="text-blue-500 animate-spin" size={32} />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
            Establishing {selectedAsset} Gateway...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl text-center">
          <WifiOff className="text-red-500 mx-auto mb-3" size={24} />
          <p className="text-xs text-red-400 font-bold mb-4">{error}</p>
          <button onClick={() => fetchAddress()} className="btn-secondary py-2 px-6 text-[10px]">
            Retry Sync
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-scale-in">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-3xl shadow-2xl shadow-blue-500/10 border-8 border-white/5">
              <QRCodeSVG value={address} size={160} level="H" includeMargin={false} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-emerald-500">
              <Wifi size={12} className="animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest">Node Active</span>
            </div>
          </div>

          {/* Address Box */}
          <div className="space-y-2">
            <label className="text-slate-500 text-[9px] font-black uppercase tracking-widest ml-1">
              Your {selectedAsset} Protocol Address
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono text-[11px] text-blue-400 break-all leading-relaxed">
                {address}
              </div>
              <button 
                onClick={handleCopy}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-xl border border-slate-600 transition-all active:scale-95 shrink-0"
              >
                {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Warning Card */}
          <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-3">
             <ShieldAlert className="text-yellow-500 shrink-0" size={18} />
             <p className="text-[9px] text-slate-400 leading-relaxed font-bold">
               <span className="text-yellow-500 uppercase">Warning:</span> Ensure you only send <span className="text-white">{selectedAsset}</span> via the supported network. Assets sent to incorrect protocols cannot be recovered.
             </p>
          </div>
        </div>
      )}
    </div>
  );
}

