import React, { useState } from 'react';
import { 
  ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  Copy, CheckCircle, Info 
} from 'lucide-react';

export default function Transfers() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const walletAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#05070a] min-h-screen text-white pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* TAB SWITCHER */}
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 mb-8">
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'deposit' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <ArrowDownLeft size={16} /> Deposit
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'withdraw' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <ArrowUpRight size={16} /> Withdrawal
          </button>
        </div>

        {/* CONTENT CARD */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          {activeTab === 'deposit' ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black mb-2">Fund Your Account</h2>
                <p className="text-slate-500 text-sm">Send BTC to the address below. Funds will auto-convert to EUR upon 3 confirmations.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Deposit Amount (EUR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold">€</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#05070a] border border-white/10 rounded-2xl py-4 pl-10 pr-4 outline-none focus:border-blue-500 transition font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">BTC Deposit Address</label>
                <div className="flex gap-3 items-center">
                  <code className="flex-1 text-xs break-all text-slate-300 font-mono bg-black/40 p-3 rounded-lg border border-white/5">
                    {walletAddress}
                  </code>
                  <button 
                    onClick={handleCopy}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition text-blue-500"
                  >
                    {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-[11px] text-yellow-200/60 leading-relaxed">
                <Info size={16} className="shrink-0 text-yellow-500" />
                <p>Ensure you use the Bitcoin (BTC) network. Sending other assets to this address will result in permanent loss of funds.</p>
              </div>
            </div>
          ) : (
            /* WITHDRAWAL FLOW */
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black mb-2">Withdraw Earnings</h2>
                <p className="text-slate-500 text-sm">Transfer your profits back to your external wallet.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Withdrawal Amount (EUR)</label>
                <input 
                  type="number" 
                  className="w-full bg-[#05070a] border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500 transition font-mono"
                  placeholder="Minimum €50.00"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Destination BTC Address</label>
                <input 
                  type="text" 
                  className="w-full bg-[#05070a] border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500 transition font-mono text-sm"
                  placeholder="Enter your external BTC wallet address"
                />
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold transition shadow-lg shadow-blue-600/20 active:scale-95">
                Confirm Withdrawal
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 text-slate-600">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-widest font-black">Secure 2026 AML Protocol Active</span>
        </div>
      </div>
    </div>
  );
}

