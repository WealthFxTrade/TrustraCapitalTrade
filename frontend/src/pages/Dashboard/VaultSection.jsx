// src/pages/Dashboard/VaultSection.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Copy, 
  CheckCircle2, 
  QrCode, 
  Info, 
  Lock,
  Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';

const VaultSection = () => {
  const [activeTab, setActiveTab] = useState('BTC');
  const [showQR, setShowQR] = useState(false);

  const vaultData = {
    BTC: {
      address: 'bc1qj4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq',
      network: 'Bitcoin (SegWit)',
      status: 'Active',
      confirmations: '3 Required'
    },
    ETH: {
      address: null, // Coming Soon
      network: 'Ethereum (ERC-20)',
      status: 'Maintenance',
      confirmations: '12 Required'
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard', {
      style: {
        background: '#111827',
        color: '#fff',
        border: '1px solid #374151',
      },
    });
  };

  return (
    <section className="relative overflow-hidden bg-gray-900/40 border border-gray-800/50 rounded-[2.5rem] p-6 md:p-10 backdrop-blur-md shadow-2xl">
      {/* Background Decorative Element */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-emerald-400" size={28} />
            Personal Liquidity Vault
          </h2>
          <p className="text-gray-500 text-sm mt-1">Encrypted institutional-grade deposit gateway</p>
        </div>

        <div className="flex bg-gray-950 p-1.5 rounded-2xl border border-gray-800">
          {['BTC', 'ETH'].map((ticker) => (
            <button
              key={ticker}
              onClick={() => {
                setActiveTab(ticker);
                setShowQR(false);
              }}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === ticker 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Side: Address Details */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">
                  {activeTab} Network Deposit Address
                </label>
                
                {vaultData[activeTab].address ? (
                  <div className="group relative">
                    <div className="bg-gray-950 border border-gray-800 p-5 rounded-2xl font-mono text-sm break-all pr-14 shadow-inner text-blue-100/90 leading-relaxed">
                      {vaultData[activeTab].address}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(vaultData[activeTab].address)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-400 transition-colors"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-950/50 border border-dashed border-gray-800 p-8 rounded-2xl text-center">
                    <Lock className="mx-auto text-gray-700 mb-2" size={32} />
                    <p className="text-gray-500 font-medium italic text-sm">
                      {vaultData[activeTab].network} support is currently under maintenance.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/30 p-4 rounded-2xl border border-gray-800/50">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Status</p>
                  <p className={`text-sm font-bold flex items-center gap-2 ${
                    vaultData[activeTab].status === 'Active' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      vaultData[activeTab].status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`} />
                    {vaultData[activeTab].status}
                  </p>
                </div>
                <div className="bg-gray-800/30 p-4 rounded-2xl border border-gray-800/50">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Confirmations</p>
                  <p className="text-sm font-bold text-gray-300">{vaultData[activeTab].confirmations}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <Info className="text-blue-400 shrink-0" size={18} />
            <p className="text-xs text-blue-200/60 leading-relaxed">
              Ensure you are sending funds via the <span className="text-blue-300 font-bold">{vaultData[activeTab].network}</span>. 
              Sending other assets or using different networks will result in permanent loss.
            </p>
          </div>
        </div>

        {/* Right Side: QR & Protocol Info */}
        <div className="flex flex-col items-center justify-center bg-gray-950/40 rounded-[2rem] border border-gray-800/50 p-8">
          {showQR && vaultData[activeTab].address ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-4 rounded-2xl mb-6 shadow-2xl shadow-blue-500/10"
            >
              {/* Mock QR Placeholder */}
              <div className="w-40 h-40 bg-slate-100 flex items-center justify-center text-slate-800 font-bold border-2 border-slate-200">
                 
              </div>
            </motion.div>
          ) : (
            <div className="mb-6 p-10 bg-gray-900 rounded-full border border-gray-800 text-blue-500/20">
              <QrCode size={80} />
            </div>
          )}

          <button 
            disabled={!vaultData[activeTab].address}
            onClick={() => setShowQR(!showQR)}
            className="w-full py-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl text-sm font-bold transition-all mb-6"
          >
            {showQR ? 'Hide Deposit QR' : 'Show Deposit QR'}
          </button>

          <div className="flex items-center gap-4 py-3 px-6 bg-gray-900/80 rounded-full border border-gray-800 shadow-inner">
            <Cpu size={16} className="text-emerald-500" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Protocol: <span className="text-emerald-500">AES-256-GCM Encrypted</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VaultSection;
