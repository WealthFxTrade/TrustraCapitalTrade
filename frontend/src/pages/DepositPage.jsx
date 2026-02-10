import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Copy,
  CheckCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function DepositPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('BTC');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------------- Fetch Wallet Address ---------------- */
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchWallet = async () => {
      setLoading(true);
      setAddress('');

      try {
        const res = await api.get(`/wallet/${currency}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (active && res?.data?.address) {
          setAddress(res.data.address);
        } else {
          throw new Error('Invalid wallet response');
        }
      } catch (err) {
        if (active) {
          toast.error(`${currency} node unavailable`);
          setAddress('');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchWallet();
    return () => {
      active = false;
      controller.abort();
    };
  }, [currency, token]);

  /* ---------------- Clipboard ---------------- */
  const copyToClipboard = async () => {
    if (!address || loading) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = address;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      toast.success('Address copied securely');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Clipboard access denied');
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen bg-[#05070a] text-white p-6 md:p-10">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Nav */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Back
            </span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <ShieldCheck size={12} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">
              Node Secure v4
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-center mb-10">
            Fund Node
          </h1>

          {/* Asset Selector */}
          <div className="flex gap-2 mb-10 p-1.5 bg-black/40 rounded-2xl border border-white/5">
            {['BTC', 'USDT', 'ETH'].map(asset => (
              <button
                key={asset}
                onClick={() => setCurrency(asset)}
                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  currency === asset
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {asset}
              </button>
            ))}
          </div>

          {/* QR */}
          <div className="bg-white p-5 rounded-[2.5rem] w-fit mx-auto mb-10 shadow-xl">
            {loading || !address ? (
              <div className="h-48 w-48 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" />
              </div>
            ) : (
              <QRCodeSVG
                value={currency === 'BTC' ? `bitcoin:${address}` : address}
                size={192}
              />
            )}
          </div>

          {/* Address */}
          <div className="space-y-6">
            <div
              onClick={copyToClipboard}
              className={`bg-black/60 border p-4 rounded-2xl transition-all relative
                ${address ? 'cursor-pointer hover:border-blue-500/50' : 'opacity-60'}
                border-white/10`}
            >
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Deposit Address ({currency})
              </p>
              <p className="text-[11px] font-mono break-all pr-10 text-slate-300">
                {address || 'Generating address…'}
              </p>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              </div>
            </div>

            {/* Warning */}
            <div className="flex gap-3 bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
              <AlertTriangle size={16} className="text-amber-500 shrink-0" />
              <p className="text-[9px] leading-relaxed text-slate-500 uppercase font-bold">
                Send only <span className="text-white">{currency}</span> to this
                address. Deposits from other networks may result in
                <span className="text-red-500"> permanent loss</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
