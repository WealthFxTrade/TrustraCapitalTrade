// src/pages/DashboardPlans.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, LayoutDashboard, History, ShieldCheck, LogOut } from 'lucide-react';

// Custom components
import PlanCard from './Dashboard/PlanCard';
import InvestModal from './Dashboard/InvestModal';

// Externalized plan data
import { plans } from '../data/plans';

export default function DashboardPlans({ logout }) {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investAmount, setInvestAmount] = useState('');

  // Calculate total potential (exclude Infinity)
  const totalPotential = useMemo(
    () =>
      plans.reduce(
        (sum, p) => sum + (p.max === Infinity ? p.min * 2 : p.max),
        0
      ),
    []
  );

  const handleInvestClick = (plan) => {
    setSelectedPlan(plan);
    setInvestAmount(plan.min); // auto-fill minimum amount
  };

  const confirmInvest = () => {
    const amount = parseFloat(investAmount);

    if (
      amount < selectedPlan.min ||
      (selectedPlan.max !== Infinity && amount > selectedPlan.max)
    ) {
      alert(
        `Invalid amount. Enter between €${selectedPlan.min.toLocaleString()} and ${
          selectedPlan.max === Infinity ? 'Unlimited' : `€${selectedPlan.max.toLocaleString()}`
        }`
      );
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
    <div className="flex min-h-screen bg-[#0a0d14] text-white font-sans selection:bg-indigo-500">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f121d] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-600/20">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight uppercase italic">Trustra</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-3 mb-2">
            Main Menu
          </p>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition text-[11px] font-black tracking-widest"
          >
            <LayoutDashboard size={18} /> DASHBOARD
          </Link>

          <div className="pt-6 pb-2 text-[10px] uppercase tracking-widest text-gray-600 px-3 font-black">
            Investments
          </div>
          <Link
            to="/plans"
            className="flex items-center gap-3 bg-indigo-600/10 text-indigo-400 p-3 rounded-xl uppercase text-[11px] font-black tracking-widest border border-indigo-600/20 shadow-inner"
          >
            <ShieldCheck size={18} /> ALL SCHEMAS
          </Link>
          <Link
            to="/logs"
            className="flex items-center gap-3 p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition text-[11px] font-black tracking-widest"
          >
            <History size={18} /> SCHEMA LOGS
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-white/5 bg-[#0f121d]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-end px-8">
          <button
            onClick={logout}
            className="text-gray-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            Logout <LogOut size={16} />
          </button>
        </header>

        <main className="p-8 max-w-7xl w-full mx-auto space-y-10">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-black tracking-tighter">Investment Schemas</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium italic">
              Execute smart-contract based growth cycles on verified nodes.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0f121d] border border-white/5 p-8 rounded-[2rem] flex justify-between items-center shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                  Ecosystem Potential
                </h3>
                <p className="text-white font-black text-3xl tracking-tighter">
                  €{totalPotential.toLocaleString()}
                </p>
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp size={28} />
              </div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-600/10 rounded-full blur-[80px]" />
            </div>

            <div className="bg-[#0f121d] border border-white/5 p-8 rounded-[2rem] flex justify-between items-center shadow-2xl">
              <div>
                <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                  Network Status
                </h3>
                <p className="text-white font-black text-3xl tracking-tighter">
                  Secure <span className="text-indigo-500 animate-pulse">●</span>
                </p>
              </div>
              <ShieldCheck size={28} className="text-indigo-500" />
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                name={plan.name}
                range={`€${plan.min.toLocaleString()} - ${plan.max === Infinity ? '∞' : `€${plan.max.toLocaleString()}`}`}
                yieldTarget={`${plan.roiDaily}%`}
                color={plan.color || 'blue'}
                link="#"
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
