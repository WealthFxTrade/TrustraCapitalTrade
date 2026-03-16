import React from 'react';

const ActivityLedger = ({ transactions = [] }) => {
  if (!transactions?.length) {
    return (
      <div className="p-10 text-center text-white/50 text-sm font-medium">
        No transactions recorded yet
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {transactions.map((tx, idx) => (
        <div
          key={idx}
          className="px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/3 transition-colors"
        >
          <div className="flex-1">
            <p className="text-white/90 font-medium">
              {tx.type || 'Transaction'} {tx.asset ? `(${tx.asset})` : ''}
            </p>
            <p className="text-white/50 text-xs mt-1">
              {tx.timestamp
                ? new Date(tx.timestamp).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}
            </p>
          </div>

          <div className="text-right mt-3 sm:mt-0">
            <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {tx.amount > 0 ? '+' : ''}{tx.amount?.toFixed(4) || '—'} {tx.asset || ''}
            </p>
            {tx.status && (
              <span className={`inline-block px-2.5 py-1 mt-1 rounded-full text-xs uppercase tracking-wider ${
                tx.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {tx.status}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLedger;
