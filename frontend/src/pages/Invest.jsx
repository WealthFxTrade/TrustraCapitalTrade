import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // FIXED: Pointing to ../ instead of ../../
import api from '../api/api';
import {
  Zap, ShieldCheck, Loader2,
  ArrowRight, Info, ChevronLeft,
  TrendingUp, AlertTriangle, Gem, Building2, Crown, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const RIO_NODES = [
  { id: 'starter', name: 'Rio Starter', min: 100, roi: '6–9%', icon: Zap, color: 'text-blue-400', border: 'border-blue-400/20', bg: 'bg-blue-400/5' },
  { id: 'basic', name: 'Rio Basic', min: 1000, roi: '9–12%', icon: Shield, color: 'text-white', border: 'border-white/20', bg: 'bg-white/5' },
  { id: 'standard', name: 'Rio Standard', min: 5000, roi: '12–16%', icon: Crown, color: 'text-yellow-500', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5' },
  { id: 'advanced', name: 'Rio Advanced', min: 15000, roi: '16–20%', icon: Building2, color: 'text-emerald-400', border: 'border-emerald-400/20', bg: 'bg-emerald-400/5' },
  { id: 'elite', name: 'Rio Elite', min: 50000, roi: '20–25%', icon: Gem, color: 'text-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/5' }
];

export default function Invest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState(RIO_NODES[2]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivation = async () => {
    if (!amount || Number(amount) < selectedNode.min) {
      return toast.error(`Minimum requirement: €${selectedNode.min.toLocaleString()}`);
    }

    setLoading(true);
    try {
      await api.post('/transactions/invest', {
        amount: Number(amount),
        planId: selectedNode.id
      });
      toast.success(`${selectedNode.name} Activated Successfully`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol activation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28 font-sans">
      <div className="max-w-7xl mx-auto mb-16">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-yellow-500 mb-8">
          <ChevronLeft size={14} /> Back to Terminal
        </button>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">Initialize Rio Node</h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-5 gap-4 mb-16">
        {RIO_NODES.map((node) => (
          <motion.div
            key={node.id}
            onClick={() => setSelectedNode(node)}
            className={`cursor-pointer p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${
              selectedNode.id === node.id ? `${node.border} ${node.bg}` : 'border-white/5 bg-white/[0.02] opacity-30 grayscale'
            }`}
          >
            <node.icon className={`${node.color} mb-6`} size={32} />
            <h3 className="text-xl font-black italic uppercase mb-1">{node.name}</h3>
            <span className={`text-2xl font-black italic ${node.color}`}>{node.roi}</span>
            <p className="text-[10px] font-bold opacity-30 uppercase mt-4">Min: €{node.min.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto bg-white/[0.03] border border-white/10 p-10 lg:p-16 rounded-[4rem] backdrop-blur-3xl">
        <div className="space-y-10">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 block text-center">Injection Amount (EUR)</label>
            <input 
              type="number"
              placeholder={`Min €${selectedNode.min.toLocaleString()}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl text-4xl font-black italic focus:outline-none focus:border-yellow-500 transition-all text-center"
            />
          </div>
          <button 
            onClick={handleActivation}
            disabled={loading || !amount}
            className="w-full py-8 bg-yellow-500 text-black rounded-[2rem] font-black uppercase italic tracking-tighter flex items-center justify-center gap-4 hover:bg-white transition-all disabled:opacity-20"
          >
            {loading ? <Loader2 className="animate-spin" /> : `Activate ${selectedNode.name}`}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
