// src/pages/Plans.jsx - Production v8.4.1
import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Zap, History, Repeat, PlusCircle, LogOut,
  ShieldCheck, ArrowRight, CheckCircle2, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RIO_PLANS = [
  { key: 'starter', name: 'Rio Starter', roi: '6–9%', min: 100, max: 999, days: 30, color: 'from-blue-500/20 to-transparent', border: 'border-blue-500/30', accent: 'text-blue-400' },
  { key: 'basic', name: 'Rio Basic', roi: '9–12%', min: 1000, max: 4999, days: 45, color: 'from-emerald-500/20 to-transparent', border: 'border-emerald-500/30', accent: 'text-emerald-400' },
  { key: 'standard', name: 'Rio Standard', roi: '12–16%', min: 5000, max: 14999, days: 60, color: 'from-yellow-500/20 to-transparent', border: 'border-yellow-500/30', accent: 'text-yellow-400' },
  { key: 'advanced', name: 'Rio Advanced', roi: '16–20%', min: 15000, max: 49999, days: 90, color: 'from-purple-500/20 to-transparent', border: 'border-purple-500/30', accent: 'text-purple-400' },
  { key: 'elite', name: 'Rio Elite', roi: '20–25%', min: 50000, max: '∞', days: 120, color: 'from-red-500/20 to-transparent', border: 'border-red-500/30', accent: 'text-red-400' },
];

function SidebarLink({ to, icon: Icon, label, active = false }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
        active 
          ? 'bg-yellow-500 text-black shadow-xl shadow-yellow-500/20' 
          : 'text-gray-500 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-black tracking-widest">{label}</span>
    </Link>
  );
}

export default function Plans() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelection = (plan) => {
    // Passing the entire plan object in state to simplify the /invest page
    navigate('/invest', { state: { selectedPlan: plan } });
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white font-sans selection:bg-yellow-500/30">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen p-8">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Zap size={22} className="text-black fill-current" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">Trustra</span>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-6 px-4">Internal Systems</p>
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="DASHBOARD" />
          <SidebarLink to="/plans" icon={Zap} label="ALL PLANS" active={true} />
          <SidebarLink to="/investments" icon={History} label="INVESTMENT LOGS" />
          <SidebarLink to="/deposit" icon={PlusCircle} label="DEPOSIT" />
          <SidebarLink to="/exchange" icon={Repeat} label="EXCHANGE" />
        </nav>

        <button 
          onClick={logout} 
          className="mt-auto flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest border-t border-white/5"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
            Tier Selection Terminal
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <ShieldCheck size={14} className="text-yellow-500" />
            <span className="text-[9px] font-black uppercase tracking-widest italic">Protocol v8.4.1 Secure</span>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
          <div className="mb-16 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">Investment Tiers</h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Deploy capital to automated high-frequency nodes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {RIO_PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`relative bg-[#0a0c10] border ${plan.border} rounded-[2.5rem] p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/5 overflow-hidden group`}
              >
                <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${plan.color} -z-0`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className={`text-4xl font-black ${plan.accent}`}>{plan.roi}</span>
                    <span className="text-[9px] font-black uppercase text-gray-500">Monthly</span>
                  </div>

                  <div className="space-y-4 mb-10">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-gray-600">Entry</span>
                      <span>€{plan.min.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-gray-600">Lock Cycle</span>
                      <span>{plan.days} Days</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-10 flex-1">
                    {['Audit Certified', 'Automated ROI', '24/7 Watcher'].map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                        <CheckCircle2 size={12} className="text-yellow-500" /> {feat}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelection(plan)}
                    className="w-full py-4 bg-white/5 hover:bg-yellow-500 text-white hover:text-black font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Select Tier <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center shrink-0">
              <Info size={32} className="text-yellow-500" />
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-sm font-black uppercase tracking-widest mb-2 italic">Node Deployment Protocol</h4>
              <p className="text-xs text-gray-500 leading-relaxed max-w-3xl font-medium">
                Our proprietary nodes leverage real-time market data to optimize capital placement. Each tier represents a different risk-to-reward calibration within the Trustra ecosystem. Capital remains locked for the duration of the cycle to ensure pool stability.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
