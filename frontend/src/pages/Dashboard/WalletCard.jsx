// src/pages/Dashboard/WalletCard.jsx
import { useState } from 'react';
import { Eye, EyeOff, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';

export default function WalletCard({ type = 'main', amount = 0 }) {
  const [isVisible, setIsVisible] = useState(true);

  // Configuration for different card types
  const config = {
    main: {
      label: 'Total Balance',
      icon: <Wallet size={20} />,
      color: 'blue',
      gradient: 'from-blue-600/20 to-transparent',
      borderColor: 'border-blue-500/20'
    },
    profit: {
      label: 'Total Profit',
      icon: <TrendingUp size={20} />,
      color: 'emerald',
      gradient: 'from-emerald-600/20 to-transparent',
      borderColor: 'border-emerald-500/20'
    }
  };

  const theme = config[type] || config.main;

  // Formatter for EUR currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className={`relative overflow-hidden bg-[#0f1218] border ${theme.borderColor} rounded-[2.5rem] p-8 transition-all hover:shadow-2xl group`}>
      
      {/* Background Gradient Accent */}
      <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${theme.gradient} opacity-30`} />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-white/5 text-${theme.color}-500`}>
              {theme.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
              {theme.label}
            </span>
          </div>
          <button 
            onClick={() => setIsVisible(!isVisible)}
            className="text-gray-600 hover:text-white transition-colors p-2"
          >
            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-black tracking-tighter text-white">
            {isVisible ? formatCurrency(amount) : '••••••••'}
          </h2>
          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase">
            Live
          </span>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Node Status</span>
            <span className="text-[10px] font-bold text-gray-400">Encrypted / 256-bit</span>
          </div>
          <div className="flex -space-x-2">
             <div className="w-6 h-6 rounded-full border-2 border-[#0f1218] bg-blue-600" />
             <div className="w-6 h-6 rounded-full border-2 border-[#0f1218] bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

