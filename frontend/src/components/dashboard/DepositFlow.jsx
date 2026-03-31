import React, { useState } from 'react';
import { 
  CreditCard, 
  Bitcoin, 
  Coins, 
  ArrowRight, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Banknote
} from 'lucide-react';
import toast from 'react-hot-toast';

const DepositFlow = () => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null); // 'bank', 'btc', 'eth'
  const [amount, setAmount] = useState('');

  const depositMethods = [
    { id: 'bank', label: 'Bank Wire / SEPA', icon: Banknote, color: 'text-blue-500', desc: 'Instant Euro Settlement' },
    { id: 'btc', label: 'Bitcoin (BTC)', icon: Bitcoin, color: 'text-orange-500', desc: 'On-chain Network Transfer' },
    { id: 'eth', label: 'Ethereum (ETH)', icon: Coins, color: 'text-indigo-500', desc: 'ERC-20 USDT/ETH Protocol' },
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Wallet Address Copied to Clipboard");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── HEADER ── */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
          Inbound <span className="text-emerald-500">Settlement</span>
        </h2>
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Step {step} of 3: {step === 1 ? 'Method Selection' : step === 2 ? 'Value Definition' : 'Final Transfer'}</p>
      </div>

      {/* ── STEP 1: SELECT METHOD ── */}
      {step === 1 && (
        <div className="grid grid-cols-1 gap-4">
          {depositMethods.map((item) => (
            <button
              key={item.id}
              onClick={() => { setMethod(item.id); setStep(2); }}
              className="bg-[#0a0c10] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between hover:border-emerald-500/30 hover:bg-white/[0.02] transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl bg-white/5 ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-white uppercase italic">{item.label}</p>
                  <p className="text-[10px] text-gray-600 font-bold uppercase">{item.desc}</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-800 group-hover:text-emerald-500 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* ── STEP 2: AMOUNT ── */}
      {step === 2 && (
        <div className="bg-[#0a0c10] border border-white/5 p-10 rounded-[2.5rem] space-y-8 shadow-2xl">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Amount to Invest (EUR Equivalent)</label>
            <div className="relative">
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 px-8 text-white text-2xl font-mono focus:border-emerald-500/50 outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-emerald-500 font-black italic text-xl">€</span>
            </div>
          </div>
          
          <button 
            disabled={!amount || amount <= 0}
            onClick={() => setStep(3)}
            className="w-full bg-emerald-500 text-black py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all disabled:opacity-20"
          >
            Generate Settlement Address
          </button>
        </div>
      )}

      {/* ── STEP 3: SETTLEMENT DATA ── */}
      {step === 3 && (
        <div className="bg-[#0a0c10] border border-white/5 p-10 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            {method === 'btc' ? <Bitcoin size={120} /> : <Banknote size={120} />}
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4 text-emerald-500">
              <CheckCircle2 size={24} />
              <h3 className="text-sm font-black uppercase tracking-widest">Address Generated Successfully</h3>
            </div>

            <div className="p-6 bg-black/60 border border-white/5 rounded-2xl space-y-4">
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Send Exactly €{amount} to:</p>
              
              <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <code className="text-xs font-mono text-white truncate">
                  {method === 'btc' ? 'bc1qj4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq' : 'TRUSTRA-CAPITAL-BANK-0021'}
                </code>
                <button onClick={() => handleCopy(method === 'btc' ? 'bc1qj4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq' : 'TRUSTRA-CAPITAL-BANK-0021')} className="text-emerald-500 hover:text-white transition-colors">
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl flex gap-4">
              <AlertCircle className="text-amber-500 shrink-0" size={20} />
              <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
                Network confirm takes 10-30 mins. Do not close this session until you have sent the transaction.
              </p>
            </div>

            <button 
              onClick={() => {setStep(1); setAmount('');}}
              className="w-full py-4 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all"
            >
              Start New Protocol
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositFlow;
