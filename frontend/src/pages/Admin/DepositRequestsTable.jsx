import React from 'react';
import { ArrowDownLeft, Clock } from 'lucide-react';

export default function DepositRequestsTable() {
  return (
    <div className="space-y-8 py-20 text-center border border-dashed border-white/5 rounded-[3rem]">
      <div className="p-6 bg-white/5 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-emerald-500">
        <ArrowDownLeft size={32} />
      </div>
      <div>
        <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Deposit Ledger Entry</h3>
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-2">Waiting for Inbound Data Streams...</p>
      </div>
    </div>
  );
}
