import React from 'react';
import CopyButton from '../ui/CopyButton.jsx';

export default function WalletDisplay({ wallet }) {
  if (!wallet) return <div className="max-w-7xl mx-auto mt-6">Assigning Secure Node Address...</div>;

  return (
    <div className="max-w-7xl mx-auto mt-6 bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
      <div className="flex flex-col gap-1">
        <span className="text-yellow-500 font-black text-[8px] uppercase tracking-[0.4em]">Personalized Deposit Address (BTC/ETH/EUR)</span>
        <span className="text-white font-mono text-xs sm:text-sm break-all select-all">{wallet}</span>
      </div>
      <CopyButton text={wallet} />
    </div>
  );
}
