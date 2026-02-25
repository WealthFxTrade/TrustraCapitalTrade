import React from 'react';
import CopyButton from '../ui/CopyButton.jsx';

export default function WalletDisplay({ wallet }) {
  // If the backend hasn't assigned a wallet yet, show a placeholder 
  // instead of returning null (which hides the UI unexpectedly)
  if (!wallet) {
    return (
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-center justify-between animate-pulse">
          <span className="text-white/20 font-black text-[10px] uppercase tracking-[0.3em]">
            Assigning Secure Node Address...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-6">
      <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div className="flex flex-col gap-1">
          <span className="text-yellow-500 font-black text-[8px] uppercase tracking-[0.4em]">
            Personalized Deposit Address (BTC/USDT)
          </span>
          <span className="text-white font-mono text-xs sm:text-sm tracking-tighter break-all select-all opacity-80">
            {wallet}
          </span>
        </div>
        
        {/* Using your custom UI CopyButton */}
        <div className="w-full sm:w-auto flex justify-end">
          <CopyButton text={wallet} />
        </div>
      </div>
      
      {/* Security Disclaimer */}
      <p className="mt-3 text-[8px] text-white/10 uppercase tracking-[0.4em] text-center sm:text-left px-2">
        Verification Required: Assets will reflect after 3 network confirmations.
      </p>
    </div>
  );
}

