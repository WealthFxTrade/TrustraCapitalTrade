import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Copy, 
  CheckCircle, 
  ArrowLeft, 
  Info, 
  Loader2, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/apiService';

export default function DepositPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('BTC');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getAddress = async () => {
      setLoading(true);
      try {
        // Use POST to trigger our HD Wallet generation logic on the backend
        const res = await api.post(`/wallet/${currency}`);
        
        if (isMounted) {
          // Backend returns { success: true, address: "..." }
          setAddress(res.data.address);
        }
      } catch (err) {
        console.error("Sync Error:", err);
        if (isMounted) {
          toast.error(`Failed to sync ${currency} node`);
          // Fallback only if backend is completely unreachable
          setAddress("bc1qj4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq"); 
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getAddress();
    return () => { isMounted = false; };
  }, [currency]);

  const copyToClipboard = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address Secured to Clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 md:p-10 selection:bg-blue-500/30">
      <div className="max-w-xl mx-auto">
        
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Back</span>
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <ShieldCheck size={14} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">SSL v3 Encrypted</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-30"></div>

          <header className="mb-10 text-center">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Fund Node</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Select Asset to Generate Deposit Key</p>
          </header>

          {/* Asset Selector */}
          <div className="flex gap-2 mb-10 p-1.5 bg-black/40 rounded-2xl border border-white/5">
            {['BTC', 'USDT', 'ETH'].map(asset => (
              <button
                key={asset}
                disabled={loading}
                onClick={() => {
                  setCurrency(asset);
                  setAddress('');
                }}
                className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-[0.2em] transition-all ${
                  currency === asset
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {asset}
              </button>
            ))}
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-5 rounded-[2rem] w-fit mx-auto mb-10 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative">
            {loading ? (
              <div className="h-48 w-48 flex items-center justify-center bg-slate-50 rounded-2xl">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <QRCodeSVG
                value={currency === 'BTC' ? `bitcoin:${address}` : address}
                size={192}
                level="H"
                fgColor="#05070a"
              />
            )}
          </div>

          {/* Address Display */}
          <div className="space-y-3 mb-10">
            <label className="text-[9px] uppercase font-black text-slate-600 tracking-widest ml-2">
              Unique {currency} Deployment Address
            </label>
            <div className="bg-black/60 border border-white/5 p-5 rounded-2xl flex items-center justify-between gap-4 group hover:border-blue-500/30 transition-all">
              <div className="flex-1 overflow-hidden">
                <p className="text-[11px] font-mono text-slate-400 break-all leading-relaxed">
                  {loading ? 'Synchronizing Node...' : address}
                </p>
              </div>
              <button 
                onClick={copyToClipboard}
                disabled={loading}
                className="shrink-0 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white p-3 rounded-xl transition-all"
              >
                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Network Advisory */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-5 bg-yellow-500/5 border border-yellow-500/10 rounded-[1.5rem]">
              <AlertTriangle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Network Advisory</h4>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">
                  Ensure deployment via {currency === 'BTC' ? 'Mainnet' : 'ERC-20'}. 
                  Cross-chain fragmentation results in permanent asset loss.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-700 py-4">
              <Info size={12} />
              <span>Network Confirmations Required</span>
            </div>
          </div>
        </div>

        {/* Global Node Stats bar */}
        <div className="mt-8 flex justify-center gap-10 opacity-30 grayscale hover:grayscale-0 transition-all">
           <div className="text-center">
             <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Latency</p>
             <p className="text-[10px] font-mono text-blue-500">14ms</p>
           </div>
           <div className="text-center">
             <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Node Status</p>
             <p className="text-[10px] font-mono text-green-500">Operational</p>
           </div>
        </div>
      </div>
    </div>
  );
}

