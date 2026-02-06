import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, LayoutDashboard, History, ShieldCheck, 
  Zap, LogOut, Star, Award, Diamond, Crown, CheckCircle2 
} from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    min: 100,
    max: 999,
    roiDaily: 0.8,
    duration: 30,
    icon: <Zap size={24} className="text-cyan-400" />,
    color: 'border-cyan-500/30 bg-cyan-500/5',
  },
  {
    name: 'Silver',
    min: 1000,
    max: 4999,
    roiDaily: 1.2,
    duration: 45,
    icon: <Star size={24} className="text-blue-400" />,
    color: 'border-blue-500/30 bg-blue-500/5',
  },
  {
    name: 'Gold',
    min: 5000,
    max: 19999,
    roiDaily: 1.8,
    duration: 60,
    icon: <Award size={24} className="text-purple-400" />,
    color: 'border-purple-500/30 bg-purple-500/5',
  },
  {
    name: 'Platinum',
    min: 20000,
    max: 99999,
    roiDaily: 2.5,
    duration: 90,
    icon: <Crown size={24} className="text-amber-400" />,
    color: 'border-amber-500/30 bg-amber-500/5',
  },
  {
    name: 'Diamond',
    min: 100000,
    max: Infinity,
    roiDaily: 3.5,
    duration: 120,
    icon: <Diamond size={24} className="text-rose-400" />,
    color: 'border-rose-500/30 bg-rose-500/5',
  },
];

export default function DashboardPlans({ logout }) {
  const navigate = useNavigate();

  const handleInvest = (planName) => {
    // Navigate to a payment confirmation or investment execution page
    navigate(`/invest/confirm?plan=${planName}`);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0d14] text-white font-sans">
      
      {/* SIDEBAR (Matches Dashboard) */}
      <aside className="w-64 bg-[#0f121d] border-r border-gray-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-800 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-lg tracking-tight">TrustraCapital</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm text-gray-400">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] font-bold tracking-widest">
            <LayoutDashboard size={18} /> DASHBOARD
          </Link>
          <div className="pt-6 pb-2 text-[10px] uppercase tracking-widest text-gray-600 px-3 font-bold">Investments</div>
          <Link to="/plans" className="flex items-center gap-3 bg-indigo-600/10 text-indigo-400 p-3 rounded-lg uppercase text-[11px] font-bold tracking-widest">
            <ShieldCheck size={18} /> ALL SCHEMA
          </Link>
          <Link to="/logs" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] font-bold tracking-widest">
            <History size={18} /> SCHEMA LOGS
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-800 bg-[#0f121d]/80 flex items-center justify-end px-8">
          <button onClick={logout} className="text-gray-400 hover:text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            Logout <LogOut size={16} />
          </button>
        </header>

        <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Investment Schema</h1>
            <p className="text-gray-500 text-sm">Choose a TrustraCapitalTrade plan to grow your wealth.</p>
          </div>

          {/* PLANS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={`border ${plan.color} rounded-3xl p-8 flex flex-col transition-all hover:translate-y-[-5px]`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/5 rounded-2xl">
                    {plan.icon}
                  </div>
                  <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest">
                    {plan.duration} Days
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">{plan.roiDaily}%</span>
                  <span className="text-gray-500 font-bold text-xs uppercase">Daily ROI</span>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex justify-between text-sm py-2 border-b border-white/5">
                    <span className="text-gray-500 font-medium">Minimum</span>
                    <span className="font-bold">€{plan.min.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-white/5">
                    <span className="text-gray-500 font-medium">Maximum</span>
                    <span className="font-bold">
                      {plan.max === Infinity ? 'No Limit' : `€${plan.max.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-green-400 font-black uppercase tracking-widest">
                    <CheckCircle2 size={14} /> Capital Back Included
                  </div>
                </div>

                <button 
                  onClick={() => handleInvest(plan.name)}
                  className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition"
                >
                  Invest In {plan.name}
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

