import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Cpu, ShieldCheck, Server, Activity, Globe, Lock 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NodeTiers() {
  const [selectedNode, setSelectedNode] = useState('Institutional');

  const tiers = [
    {
      id: 'Bronze',
      title: 'Neural Core',
      hashrate: '125 TH/s',
      multiplier: '1.2x',
      pnlTarget: '5-8%',
      price: '€2,500',
      color: 'border-orange-900/50 text-orange-500',
      bg: 'bg-orange-500/5',
      features: ['Standard Execution', 'Daily Payouts', 'Email Support']
    },
    {
      id: 'Gold',
      title: 'Quantum Synapse',
      hashrate: '850 TH/s',
      multiplier: '2.5x',
      pnlTarget: '12-18%',
      price: '€15,000',
      color: 'border-yellow-500/50 text-yellow-500',
      bg: 'bg-yellow-500/5',
      features: ['Priority Flash-Bot Access', 'Hedging Protection', 'Dedicated Manager']
    },
    {
      id: 'Institutional',
      title: 'Zurich Mainframe',
      hashrate: '4.2 PH/s',
      multiplier: '5.0x',
      pnlTarget: '25%+',
      price: '€50,000',
      color: 'border-blue-500/50 text-blue-400',
      bg: 'bg-blue-500/5',
      features: ['Institutional Liquidity', 'Zero-Slippage Engine', 'Hardware Cold Storage']
    }
  ];

  const handleUpgrade = (tierId) => {
    toast.loading(`Synchronizing with ${tierId} Node...`);
    setTimeout(() => {
      toast.dismiss();
      toast.success(`${tierId} Cluster Active`, { icon: '⚙️' });
    }, 2000);
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Cpu className="text-yellow-500" size={24} />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">Network Architecture</h2>
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Node <span className="text-yellow-500 font-normal not-italic">Tiers</span></h1>
        </div>
        <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-[2rem] flex items-center gap-8 backdrop-blur-md">
          <div className="text-right">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Global Status</p>
            <p className="text-sm font-bold text-emerald-500 italic">99.98% Uptime</p>
          </div>
          <Globe className="text-gray-700 animate-spin" style={{ animationDuration: '10s' }} size={32} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <motion.div
            key={tier.id}
            whileHover={{ y: -10 }}
            onClick={() => setSelectedNode(tier.id)}
            className={`relative p-10 rounded-[3rem] border-2 transition-all cursor-pointer overflow-hidden ${
              selectedNode === tier.id 
                ? `${tier.color} ${tier.bg} shadow-2xl shadow-yellow-500/5` 
                : 'border-white/5 bg-white/2 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">{tier.id} Level</span>
              <h3 className="text-3xl font-black italic uppercase tracking-tight">{tier.title}</h3>
            </div>
            <div className="space-y-6 mb-10 font-bold uppercase tracking-widest text-[10px]">
              <div className="flex justify-between border-b border-white/5 pb-4">
                <span className="text-gray-500">Hashrate</span>
                <span>{tier.hashrate}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-4">
                <span className="text-gray-500">Multiplier</span>
                <span>{tier.multiplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Target</span>
                <span className="text-emerald-400">{tier.pnlTarget}</span>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleUpgrade(tier.id); }}
              className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm transition-all ${
                selectedNode === tier.id ? 'bg-yellow-500 text-black' : 'bg-white/5 text-white'
              }`}
            >
              {selectedNode === tier.id ? 'Active Cluster' : `Deploy Node`}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
