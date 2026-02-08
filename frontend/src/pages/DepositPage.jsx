import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; // Standard for 2026 React apps
import { Copy, CheckCircle, ArrowLeft, Info, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
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

  // 1. Fetch or Derive Address
  useEffect(() => {
    let isMounted = true;
    const getAddress = async () => {
      setLoading(true);
      try {
        // If BTC, use the unique address generated at signup
        if (currency === 'BTC' && user?.btcAddress) {
          setAddress(user.btcAddress);
        } else {
          // Fetch admin/dynamic address for other assets
          const res = await api.get(`/wallet/address/${currency}`);
          const newAddress = res.data.address || res.data;
          if (isMounted) setAddress(newAddress);
        }
      } catch (err) {
        if (isMounted) toast.error(`Failed to sync ${currency} node`);
        setAddress("bc1qj4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq"); // Fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getAddress();
    return () => { isMounted = false; };
  }, [currency, user]);

  const copyToClipboard = () => {
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
                onClick={() => setCurrency(asset)}
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
            <div className="bg-black/60 border border-white/5 p-5 rounded-2xl flex items-center justify-between gap-4 group hover:border-blue-500/30 transition-colors">
              <code className="text-blue-400 text-[11px] font-mono break-all leading-relaxed">
                {loading ? "Synchronizing with blockchain..." : address}
              </code>
              <button 
                onClick={copyToClipboard}
                disabled={loading}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-90 disabled:opacity-30"
              >
                {copied ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={18} className="text-slate-500" />}
              </button>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex gap-4 items-start">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Important</p>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                Send only <span className="text-white font-bold">{currency}</span> to this address. 
                {currency === 'USDT' && " Ensure you use the ERC-20 network."}
                Minimum deposit is €50. Assets arrive after 3 network confirmations.
              </p>
            </div>
          </div>

        </div>

        <p className="mt-10 text-center text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">
          Trustra Global Node • 2026
        </p>
      </div>
    </div>
  );
}

