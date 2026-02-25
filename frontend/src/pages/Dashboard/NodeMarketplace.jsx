import React, { useState } from 'react';
import { ShieldCheck, Zap, TrendingUp, ChevronRight, Activity, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/api';

const RIO_NODES = [
  { id: 'rio-starter', name: 'Rio Starter', roi: '6–9%', range: [100, 999], speed: 'Standard', color: 'text-slate-400' },
  { id: 'rio-basic', name: 'Rio Basic', roi: '9–12%', range: [1000, 4999], speed: 'Enhanced', color: 'text-blue-400' },
  { id: 'rio-standard', name: 'Rio Standard', roi: '12–16%', range: [5000, 14999], speed: 'High-Freq', color: 'text-emerald-400' },
  { id: 'rio-advanced', name: 'Rio Advanced', roi: '16–20%', range: [15000, 49999], speed: 'Ultra-Low Latency', color: 'text-purple-400' },
  { id: 'rio-elite', name: 'Rio Elite', roi: '20–25%', range: [50000, 1000000], speed: 'Institutional Overdrive', color: 'text-yellow-500' },
];

export default function NodeMarketplace({ userBalance = 0 }) {
  const [loadingNode, setLoadingNode] = useState(null);

  const handleDeploy = async (node) => {
    if (userBalance < node.range[0]) {
      return toast.error(`Insufficient Capital. Min. €${node.range[0].toLocaleString()} required.`);
    }

    setLoadingNode(node.id);
    try {
      // API call to backend to create the investment
      const res = await api.post('/investments/deploy', { nodeId: node.id });
      toast.success(`${node.name} Deployed Successfully`);
      // Optional: Redirect to active nodes or refresh dashboard
    } catch (err) {
      toast.error(err.response?.data?.message || 'Node deployment failed');
    } finally {
      setLoadingNode(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Node Infrastructure</h2>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-1">Select an algorithmic deployment vector</p>
        </div>
        <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Available Capital</p>
          <p className="text-sm font-mono font-bold text-white">€{userBalance.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {RIO_NODES.map((node) => {
          const isAffordable = userBalance >= node.range[0];
          
          return (
            <div key={node.id} className="group relative bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] p-8 hover:border-white/20 transition-all duration-500 overflow-hidden">
              {/* Background Glow */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 blur-[50px] rounded-full group-hover:bg-yellow-500/10 transition-colors" />

              <div className="flex justify-between items-start mb-8">
                <div className={`p-3 bg-white/5 rounded-2xl ${node.color}`}>
                  <Zap size={24} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Target Yield</p>
                  <p className={`text-2xl font-black italic ${node.color}`}>{node.roi}</p>
                </div>
              </div>

              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">{node.name}</h3>
              <div className="flex items-center gap-2 mb-6">
                <Activity size={12} className="text-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{node.speed}</span>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-white/20">Entry Range</span>
                  <span className="text-white/60">€{node.range[0].toLocaleString()} — {node.range[1] >= 1000000 ? '∞' : `€${node.range[1].toLocaleString()}`}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full bg-current ${node.color}`} style={{ width: `${(Math.min(userBalance, node.range[1]) / node.range[1]) * 100}%` }} />
                </div>
              </div>

              <button
                disabled={!isAffordable || loadingNode === node.id}
                onClick={() => handleDeploy(node)}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all ${
                  isAffordable 
                    ? 'bg-white text-black hover:bg-yellow-500 active:scale-95' 
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
              >
                {loadingNode === node.id ? (
                  'Initializing Node...'
                ) : !isAffordable ? (
                  <span className="flex items-center gap-2"><Lock size={12} /> Insufficient Balance</span>
                ) : (
                  <>Deploy Node <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Network Security Note */}
      <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl flex items-center gap-4">
        <ShieldCheck className="text-yellow-500 shrink-0" size={24} />
        <p className="text-[9px] text-white/30 uppercase leading-relaxed font-bold tracking-widest">
          All node deployments are protected by the <span className="text-white/60">Zurich Institutional Safeguard</span>. Yields are generated via 2026-compliant automated liquidity provisioning.
        </p>
      </div>
    </div>
  );
}

