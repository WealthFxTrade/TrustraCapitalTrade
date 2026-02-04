import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RecentTransactions({ transactions = [] }) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Recent Activity</h2>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
          Last 5 Transactions
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <Clock className="h-10 w-10 mb-3 opacity-20" />
          <p className="text-sm font-medium">No activity recorded yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-left border-separate border-spacing-x-2">
            <thead>
              <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="pb-4 pl-4">Transaction</th>
                <th className="pb-4">Amount</th>
                <th className="pb-4 hidden md:table-cell">Date</th>
                <th className="pb-4 pr-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transactions.slice(0, 5).map((tx, i) => {
                const isDeposit = tx.type?.toLowerCase() === 'deposit' || tx.amount > 0;
                
                return (
                  <tr key={tx._id || i} className="group hover:bg-slate-800/50 transition-colors">
                    {/* TYPE */}
                    <td className="py-4 pl-4 rounded-l-xl">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDeposit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {isDeposit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <span className="font-bold text-slate-200 capitalize">{tx.type || 'Transfer'}</span>
                      </div>
                    </td>

                    {/* AMOUNT */}
                    <td className="py-4">
                      <span className={`font-mono font-bold ${isDeposit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isDeposit ? '+' : '-'}${Math.abs(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="py-4 text-slate-500 hidden md:table-cell">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                    </td>

                    {/* STATUS */}
                    <td className="py-4 pr-4 text-right rounded-r-xl">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border
                        ${tx.status === 'completed' || tx.status === 'approved' 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' 
                          : tx.status === 'failed' || tx.status === 'rejected'
                          ? 'bg-rose-500/5 border-rose-500/20 text-rose-500'
                          : 'bg-amber-500/5 border-amber-500/20 text-amber-500'
                        }`}>
                        {tx.status === 'completed' || tx.status === 'approved' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                        {tx.status || 'pending'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

