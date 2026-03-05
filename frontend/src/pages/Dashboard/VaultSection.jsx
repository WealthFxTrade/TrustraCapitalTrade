import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ShieldCheck, Zap, QrCode, X } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function VaultSection() {
  const [addresses, setAddresses] = useState({ BTC: '', ETH: '' });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const [activeQR, setActiveQR] = useState(null); // Track which QR is visible

  useEffect(() => {
    const fetchVault = async () => {
      try {
        const res = await api.get('/user/vault-addresses');
        setAddresses(res.data.addresses);
      } catch (err) {
        toast.error("Vault Synchronization Failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchVault();
  }, []);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type} Node Address Copied`);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <section className="mt-12 relative">
      {/* ── QR MODAL OVERLAY ── */}
      {activeQR && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#020408]/90 backdrop-blur-xl">
          <div className="bg-[#0a0c10] border border-white/10 p-10 rounded-[3rem] max-w-sm w-full text-center relative shadow-[0_0_100px_rgba(234,179,8,0.1)]">
            <button 
              onClick={() => setActiveQR(null)}
              className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-all"
            >
              <X size={20} className="text-gray-500" />
            </button>
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">Scan {activeQR} Node</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-8 text-center">Protocol V8.6 Direct Sync</p>
            
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
              className="w-full py-4 bg-yellow-500 text-black font-black uppercase italic rounded-xl flex items-center justify-center gap-3"
            >
              <Copy size={16} /> Copy Address
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-white/5" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/50 italic">
          Personal Liquidity Vault
        </h2>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {['BTC', 'ETH'].map((coin) => (
          <div key={coin} className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] group hover:border-yellow-500/20 transition-all duration-500 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-white/5 ${coin === 'BTC' ? 'text-orange-500' : 'text-blue-500'}`}>
                    <Zap size={18} />
                  </div>
                  <span className="font-black italic uppercase tracking-tighter text-xl">{coin} Network</span>
                </div>
                <button 
                  onClick={() => setActiveQR(coin)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all"
                >
                  <QrCode size={14} className="text-yellow-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Show QR</span>
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Unique Deposit Address</p>
                <div className="flex items-center gap-3 bg-black/40 p-5 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all">
                  <code className="text-[11px] font-mono text-yellow-500/80 truncate flex-1 break-all">
                    {loading ? "Allocating Protocol..." : (coin === 'BTC' ? addresses.BTC : addresses.ETH)}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(coin === 'BTC' ? addresses.BTC : addresses.ETH, coin)}
                    className="p-3 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-xl transition-all"
                  >
                    {copied === coin ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                <ShieldCheck size={14} />
                <span>Encrypted via AES-256 Protocol</span>
              </div>
            </div>
            
            <span className="absolute -right-4 -bottom-8 text-[120px] font-black italic opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-all">
              {coin}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
