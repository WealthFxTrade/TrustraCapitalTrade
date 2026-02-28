// src/pages/DashboardPlans.jsx - Production v8.4.1
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, LayoutDashboard, History, 
  ShieldCheck, LogOut, Box, Zap, 
  ArrowRight, Globe
} from 'lucide-react';

// Custom components
import PlanCard from './Dashboard/PlanCard';
import InvestModal from './Dashboard/InvestModal';
// Externalized plan data
import { plans } from '../data/plans';

export default function DashboardPlans({ logout }) {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investAmount, setInvestAmount] = useState('');

  // Calculate total potential (exclude Infinity for display purposes)
  const totalPotential = useMemo(
    () => plans.reduce((sum, p) => sum + (p.max === Infinity ? p.min * 5 : p.max), 0),
    []
  );

  const handleInvestClick = (plan) => {
    setSelectedPlan(plan);
    setInvestAmount(plan.min); 
  };

  const confirmInvest = () => {
    const amount = parseFloat(investAmount);
    if (amount < selectedPlan.min || (selectedPlan.max !== Infinity && amount > selectedPlan.max)) {
      alert(`Invalid amount. Required: €${selectedPlan.min.toLocaleString()} - ${selectedPlan.max === Infinity ? 'Unlimited' : `€${selectedPlan.max.toLocaleString()}`}`);
      return;
    }

    navigate('/invest/confirm', {
      state: {
        planId: selectedPlan.id,
        name: selectedPlan.name,
        amount,
        roiDaily: selectedPlan.roiDaily,
        duration: selectedPlan.duration,
        timestamp: Date.now(),
      },
    });
    setSelectedPlan(null);
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white font-sans selection:bg-yellow-500/30">
      
      {/* Institutional Sidebar */}
      <aside className="w-72 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl z-40">
        <div className="p-8 border-b border-white/5 flex items-center gap-3">
          <div className="bg-yellow-500 p-2 rounded-xl shadow-lg shadow-yellow-500/10">
            <Zap className="h-5 w-5 text-black" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">Trustra</span>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] px-3 mb-4">Navigation</p>
          <Link to="/dashboard" className="flex items-center gap-4 p-4 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition text-[11px] font-black tracking-widest uppercase">
            <LayoutDashboard size={18} /> Overview
          </Link>
          
          <div className="pt-8 pb-4 text-[10px] uppercase tracking-[0.4em] text-gray-600 px-3 font-black">Growth Cycles</div>
          <Link to="/plans" className="flex items-center gap-4 bg-yellow-500/10 text-yellow-500 p-4 rounded-2xl text-[11px] font-black tracking-widest border border-yellow-500/20 shadow-inner uppercase">
            <Box size={18} /> Active Schemas
          </Link>
          <Link to="/logs" className="flex items-center gap-4 p-4 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition text-[11px] font-black tracking-widest uppercase">
            <History size={18} /> Node History
          </Link>
        </nav>

        <div className="p-6 border-t border-white/5">
           <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Node Status: Online</span>
           </div>
        </div>
      </aside>

      {/* Main Command Center */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-10">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600 lg:hidden">
            <Zap size={14} className="text-yellow-500" /> Trustra
          </div>
          <div className="flex items-center gap-8 ml-auto">
            <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
               <Globe size={14} /> Server: Frankfurt-01
            </div>
            <button onClick={logout} className="text-gray-500 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
              Secure Logout <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="p-8 lg:p-12 max-w-7xl w-full mx-auto space-y-12">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-5xl font-black tracking-tighter italic uppercase">Investment Schemas</h1>
              <p className="text-gray-500 text-xs mt-2 font-black uppercase tracking-[0.3em]">
                Execute High-Yield Growth Cycles on Tier-1 Mining Infrastructure.
              </p>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0a0c10] border border-white/5 p-10 rounded-[3rem] flex justify-between items-center shadow-2xl group hover:border-yellow-500/20 transition-all">
              <div>
                <h3 className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Ecosystem Capacity</h3>
                <p className="text-white font-black text-4xl tracking-tighter italic">€{totalPotential.toLocaleString()}</p>
              </div>
              <div className="bg-yellow-500/10 p-5 rounded-[1.5rem] text-yellow-500 group-hover:scale-110 transition-transform duration-500 border border-yellow-500/20">
                <TrendingUp size={32} />
              </div>
            </div>

            <div className="bg-[#0a0c10] border border-white/5 p-10 rounded-[3rem] flex justify-between items-center shadow-2xl">
              <div>
                <h3 className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Network Security</h3>
                <p className="text-white font-black text-4xl tracking-tighter italic uppercase">
                  Verified <span className="text-emerald-500 animate-pulse">●</span>
                </p>
              </div>
              <ShieldCheck size={32} className="text-yellow-500" />
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                name={plan.name}
                range={`€${plan.min.toLocaleString()} - ${plan.max === Infinity ? 'Unlimited' : `€${plan.max.toLocaleString()}`}`}
                yieldTarget={`${plan.roiDaily}%`}
                color="yellow" // Matches central brand
                onInvest={() => handleInvestClick(plan)}
              />
            ))}
          </div>
        </main>
      </div>

      {/* Invest Modal */}
      {selectedPlan && (
        <InvestModal
          plan={selectedPlan}
          amount={investAmount}
          setAmount={setInvestAmount}
          onClose={() => setSelectedPlan(null)}
          onConfirm={confirmInvest}
        />
      )}
    </div>
  );
}
