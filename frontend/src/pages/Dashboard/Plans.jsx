import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Zap, History, Repeat, PlusCircle, LogOut,
  ShieldCheck, ArrowRight, CheckCircle2, Info, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RIO_PLANS = [
  { key: 'starter', name: 'Rio Starter', roi: '6–9%', min: 100, max: 999, days: 30, color: 'from-blue-500/20', border: 'border-blue-500/30', accent: 'text-blue-400' },
  { key: 'basic', name: 'Rio Basic', roi: '9–12%', min: 1000, max: 4999, days: 60, color: 'from-emerald-500/20', border: 'border-emerald-500/30', accent: 'text-emerald-400' },
  { key: 'standard', name: 'Rio Standard', roi: '12–16%', min: 5000, max: 14999, days: 90, color: 'from-yellow-500/20', border: 'border-yellow-500/30', accent: 'text-yellow-400' },
  { key: 'advanced', name: 'Rio Advanced', roi: '16–20%', min: 15000, max: 49999, days: 120, color: 'from-purple-500/20', border: 'border-purple-500/30', accent: 'text-purple-400' },
  { key: 'elite', name: 'Rio Elite', roi: '20–25%', min: 50000, max: '∞', days: 180, color: 'from-red-500/20', border: 'border-red-500/30', accent: 'text-red-400' },
];

function SidebarLink({ to, icon: Icon, label, active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
        active
          ? 'bg-yellow-500 text-black shadow-xl shadow-yellow-500/20'
          : 'text-gray-500 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={18} className={active ? 'text-black' : 'text-gray-500 group-hover:text-white'} />
      <span className="text-[10px] font-black tracking-[0.2em] uppercase italic">{label}</span>
    </Link>
  );
}

export default function Plans() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelection = (plan) => {
    // Navigating to Invest page with the plan data in state
    navigate('/invest', { state: { selectedPlan: plan } });
  };

  return (
    <div className="flex min-h-screen bg-[#020408] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden">
      
      {/* Sidebar - Desktop Only */}
      <aside className="w-72 bg-[#05070a] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
            <Zap size={22} className="text-black fill-current" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">Trustra</span>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-6 px-4">Internal Systems</p>
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink to="/plans" icon={Zap} label="All Plans" active={location.pathname === '/plans'} />
          <SidebarLink to="/investments" icon={History} label="Investment Logs" />
          <SidebarLink to="/deposit" icon={PlusCircle} label="Deposit" />
          <SidebarLink to="/exchange" icon={Repeat} label="Exchange" />
        </nav>

        <button onClick={logout} className="mt-auto flex items-center gap-4 px-6 py-4 text-gray-600 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest border-t border-white/5">
          <LogOut size={18} /> Disconnect Node
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-[#020408]/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_#eab308]" />
            Tier Selection Terminal
          </div>
          <div className="flex items-center gap-4">
             <ShieldCheck size={16} className="text-emerald-500" />
             <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest text-gray-500">AES-256 Multi-Layer Audit</span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-12 max-w-[1600px] mx-auto w-full space-y-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-12">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
                Investment <span className="text-yellow-500">Tiers</span>
              </h1>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                Deploy capital to automated high-frequency nodes
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-4 text-gray-600">
               <Globe size={20} />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Global Yield Markets Active</span>
            </div>
          </div>

          {/* Plan Grid - Horizontal Scroll on small mobile, Grid on Tablet+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            {RIO_PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`relative bg-[#0a0c10] border ${plan.border} rounded-[3rem] p-8 flex flex-col transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-yellow-500/5 group overflow-hidden`}
              >
                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 w-full h-40 bg-gradient-to-b ${plan.color} to-transparent opacity-40 -z-0`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter mb-1 text-white group-hover:text-yellow-500 transition-colors">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-8 border-b border-white/5 pb-6">
                    <span className={`text-4xl font-black tracking-tighter ${plan.accent}`}>{plan.roi}</span>
                    <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Target Yield</span>
                  </div>

                  <div className="space-y-4 mb-10">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <span className="text-gray-600">Entry Min</span>
                      <span className="text-white">€{plan.min.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <span className="text-gray-600">Max Cap</span>
                      <span className="text-white">{plan.max === '∞' ? 'NO LIMIT' : `€${plan.max.toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <span className="text-gray-600">Lock Cycle</span>
                      <span className="text-yellow-500">{plan.days} Days</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-12 flex-1">
                    {['Audit Certified', 'Automated ROI', '24/7 Watcher'].map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-[9px] font-black text-gray-500 uppercase tracking-tight">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {feat}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelection(plan)}
                    className="w-full py-5 bg-white text-black hover:bg-yellow-500 font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group/btn shadow-xl shadow-black/20 active:scale-95"
                  >
                    Select Tier <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Info Footer Block */}
          <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 opacity-70 hover:opacity-100 transition-opacity">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-[2rem] flex items-center justify-center shrink-0 border border-yellow-500/20">
              <Info size={36} className="text-yellow-500" />
            </div>
            <div className="text-center md:text-left space-y-3">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white italic">Node Deployment Protocol</h4>
              <p className="text-[11px] text-gray-500 leading-loose max-w-4xl font-bold uppercase tracking-tight">
                Our proprietary nodes leverage real-time market data to optimize capital placement. Each tier represents a different risk-to-reward calibration within the Trustra ecosystem. Capital remains locked for the duration of the cycle to ensure pool stability. Daily payouts are credited to your accrued yield ledger.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
