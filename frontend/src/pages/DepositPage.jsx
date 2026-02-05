import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getDepositAddress } from '../api';
import { Copy, CheckCircle, ArrowLeft, Info, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DepositPage() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('BTC');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch address whenever currency changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchAddress = async () => {
      setLoading(true);
      try {
        const res = await getDepositAddress(currency);
        // SAFEGUARD: Handle both { data: { address } } and { address }
        const newAddress = res.address || res.data?.address || res.data;
        
        if (isMounted) {
          if (typeof newAddress === 'string') {
            setAddress(newAddress);
          } else {
            throw new Error("Invalid address format received");
          }
        }
      } catch (err) {
        console.error("Deposit Fetch Error:", err);
        if (isMounted) toast.error(`Failed to generate ${currency} address`);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAddress();
    return () => { isMounted = false; };
  }, [currency]);

  const copyToClipboard = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 selection:bg-indigo-500/30">
      <div className="max-w-xl mx-auto">
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 mb-8 hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Dashboard
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/50">
          <header className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Deposit Funds</h1>
            <p className="text-slate-400 text-sm">Select your preferred asset to see your unique wallet.</p>
          </header>

          {/* Currency Selector */}
          <div className="flex gap-3 mb-10 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800">
            {['BTC', 'USDT', 'ETH'].map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`flex-1 py-3 rounded-xl font-bold text-xs tracking-widest transition-all active:scale-95 ${
                  currency === c 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* QR Code Area */}
          <div className="bg-white p-5 rounded-3xl w-fit mx-auto mb-10 shadow-xl relative group">
            {loading ? (
              <div className="h-48 w-48 flex items-center justify-center bg-slate-100 rounded-2xl">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <div className="relative">
                <QRCodeSVG value={address} size={192} level="H" includeMargin={false} />
                <div className="absolute inset-0 border-4 border-white rounded-sm" />
              </div>
            )}
          </div>

          {/* Address Display */}
          <div className="space-y-2 mb-10">
            <label className="text-[10px] uppercase font-black text-slate-600 tracking-tighter ml-1">
              Your {currency} Deposit Address
            </label>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4 group hover:border-indigo-500/50 transition-colors">
              <code className="text-indigo-400 text-xs font-mono break-all leading-relaxed">
                {loading ? "Generating secure address..." : address}
              </code>
              <button 
                onClick={copyToClipboard} 
                disabled={loading}
                className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all active:scale-90 disabled:opacity-50"
              >
                {copied ? <CheckCircle size={20} className="text-emerald-500" /> : <Copy size={18} className="text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex gap-4 p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
            <Info className="text-indigo-500 shrink-0 mt-0.5" size={18} />
            <div className="space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                Send only <strong className="text-indigo-400">{currency}</strong> to this address. 
                Sending any other coin will result in permanent loss.
              </p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                System: Automatic confirmation (3 blocks)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

