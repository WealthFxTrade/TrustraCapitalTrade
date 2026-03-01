import React from 'react';
import { useAdminLive } from '../../context/AdminLiveContext';
import { 
  ArrowDownCircle, ArrowUpCircle, Zap, 
  Clock, AlertCircle, Loader2 
} from 'lucide-react';

export default function ActivityFeed() {
  const { activities, loading } = useAdminLive();

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
      <Loader2 className="animate-spin text-rose-500" size={24} />
      <span className="text-[9px] font-black uppercase tracking-[0.3em]">Syncing Feed...</span>
    </div>
  );

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      {activities.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 p-10 rounded-3xl text-center">
          <p className="text-[9px] font-black uppercase text-gray-700 tracking-widest italic">
            No network activity detected in last 24h.
          </p>
        </div>
      ) : (
        activities.map((log) => (
          <div 
            key={log._id} 
            className="bg-[#0a0c10] border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all animate-in slide-in-from-right duration-500"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${getIconBg(log.type)}`}>
                {getIcon(log.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase italic tracking-tighter text-white">
                    {log.user?.fullName || 'System Node'}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-700 px-2 py-0.5 bg-white/5 rounded-full">
                    {log.type}
                  </span>
                </div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                  {log.description || `Processed ${log.amount} BTC`}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className={`text-[11px] font-black italic tracking-tighter ${getAmountColor(log.type)}`}>
                {log.type === 'withdrawal' ? '-' : '+'}{log.amount?.toFixed(4)} BTC
              </p>
              <div className="flex items-center justify-end gap-1 mt-1 text-gray-700">
                <Clock size={10} />
                <span className="text-[8px] font-black uppercase tracking-widest">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Helper: Dynamic Styling Engines
const getIcon = (type) => {
  switch (type) {
    case 'deposit': return <ArrowDownCircle size={16} className="text-emerald-500" />;
    case 'withdrawal': return <ArrowUpCircle size={16} className="text-rose-500" />;
    case 'investment': return <Zap size={16} className="text-blue-500" />;
    default: return <AlertCircle size={16} className="text-yellow-500" />;
  }
};

const getIconBg = (type) => {
  switch (type) {
    case 'deposit': return 'bg-emerald-500/10';
    case 'withdrawal': return 'bg-rose-500/10';
    case 'investment': return 'bg-blue-500/10';
    default: return 'bg-yellow-500/10';
  }
};

const getAmountColor = (type) => {
  switch (type) {
    case 'deposit': return 'text-emerald-500';
    case 'withdrawal': return 'text-rose-500';
    case 'investment': return 'text-blue-500';
    default: return 'text-white';
  }
};
