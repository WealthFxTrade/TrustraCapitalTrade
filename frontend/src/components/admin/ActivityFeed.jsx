import React from 'react';
import { useAdminLive } from '../../context/AdminLiveContext';
import { 
  ArrowDownCircleIcon, 
  ArrowUpCircleIcon, 
  UserIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

const ActivityFeed = () => {
  const { events } = useAdminLive();

  const getEventIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownCircleIcon className="h-6 w-6 text-green-500" />;
      case 'WITHDRAWAL':
        return <ArrowUpCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <UserIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Live Activity Feed</h3>
        <span className="flex items-center text-xs text-green-400">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live Sync
        </span>
      </div>

      <div className="overflow-y-auto max-h-[500px] scrollbar-hide">
        {events.length === 0 ? (
          <div className="p-10 text-center text-slate-500 italic">
            Waiting for blockchain activity...
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {events.map((event) => (
              <div key={event.id || event.timestamp} className="p-4 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="bg-slate-800 p-2 rounded-lg">
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {event.type === 'DEPOSIT' ? 'BTC Deposit Detected' : 'Withdrawal Request'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {event.email}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`text-sm font-bold ${event.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'}`}>
                        {event.type === 'DEPOSIT' ? '+' : '-'}{event.amountBtc || event.amountEur} {event.type === 'DEPOSIT' ? 'BTC' : 'EUR'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center text-[10px] text-slate-500 uppercase font-mono">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;

