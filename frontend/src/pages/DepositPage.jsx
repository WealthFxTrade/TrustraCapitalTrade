import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getDepositAddress } from '../api';
import { Copy, CheckCircle, ArrowLeft, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DepositPage() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('BTC');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddress();
  }, [currency]);

  const fetchAddress = async () => {
    setLoading(true);
    try {
      const res = await getDepositAddress(currency);
      setAddress(res.data.address);
    } catch (err) {
      toast.error("Failed to generate deposit address");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 mb-8 hover:text-white">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-2">Deposit Funds</h1>
          <p className="text-slate-400 text-sm mb-8">Select currency and transfer to the address below.</p>

          <div className="flex gap-4 mb-8">
            {['BTC', 'USDT', 'ETH'].map(c => (
              <button 
                key={c}
                onClick={() => setCurrency(c)}
                className={`flex-1 py-3 rounded-xl font-bold transition ${currency === c ? 'bg-indigo-600' : 'bg-slate-800'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="bg-white p-4 rounded-2xl w-fit mx-auto mb-8">
            {loading ? <div className="h-48 w-48 animate-pulse bg-slate-200" /> : (
              <QRCodeSVG value={address} size={200} />
            )}
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4 mb-8">
            <code className="text-indigo-400 text-xs break-all">{loading ? "Generating..." : address}</code>
            <button onClick={copyToClipboard} className="p-2 hover:bg-slate-800 rounded-lg">
              {copied ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
            </button>
          </div>

          <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <Info className="text-blue-400 shrink-0" size={20} />
            <p className="text-xs text-blue-200 leading-relaxed">
              Only send {currency} to this address. Sending other assets will result in permanent loss. 
              Credits usually appear after 3 network confirmations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

