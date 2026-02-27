// src/pages/Plans.jsx - Production v8.4.1
import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Zap, History, Repeat, PlusCircle, LogOut, 
  ShieldCheck, ArrowRight, CheckCircle2, TrendingUp, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RIO_PLANS = [
  { key: 'starter', name: 'Rio Starter', roi: '6–9%', min: 100, max: 999, days: 30, color: 'from-blue-500/20 to-transparent', border: 'border-blue-500/30' },
  { key: 'basic', name: 'Rio Basic', roi: '9–12%', min: 1000, max: 4999, days: 45, color: 'from-emerald-500/20 to-transparent', border: 'border-emerald-500/30' },
  { key: 'standard', name: 'Rio Standard', roi: '12–16%', min: 5000, max: 14999, days: 60, color: 'from-amber-500/20 to-transparent', border: 'border-amber-500/30' },
  { key: 'advanced', name: 'Rio Advanced', roi: '16–20%', min: 15000, max: 49999, days: 90, color: 'from-purple-500/20 to-transparent', border: 'border-purple-500/30' },
  { key: 'elite', name: 'Rio Elite', roi: '20–25%', min: 50000, max: '∞', days: 120, color: 'from-red-500/20 to-transparent', border: 'border-red-500/30' },
];

function SidebarLink({ to, icon, label, active = false }) {
  return (
    <Link to={to} className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
      {icon}
      <span className="text-[10px] font-black tracking-widest">{label}</span>
    </Link>
  );
}

export default function Plans() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelection = (planKey) => {
    navigate('/invest', { state: { selectedPlan: planKey } });
  };

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen p-8">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Zap size={22} className="text-white fill-current" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">Trustra</span>
        </div>
        <nav className="flex-1 space-y-2">
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18}/>} label="DASHBOARD" />
          <SidebarLink to="/plans" icon={<Zap size={18}/>} label="ALL PLANS" active={true} />
          <SidebarLink to="/investments" icon={<History size={18}/>} label="INVESTMENT LOGS" />
          <SidebarLink to="/deposit" icon={<PlusCircle size={18}/>} label="DEPOSIT" />
          <SidebarLink to="/exchange" icon={<Repeat size={18}/>} label="EXCHANGE" />
        </nav>
        <button onClick={logout} className="mt-auto flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest">
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tier Selection Terminal</div>
          <div className="flex items-center gap-3 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
             <ShieldCheck size={14} className="text-indigo-400" />
             <span className="text-[9px] font-black uppercase tracking-widest">Protocol v8.4.1 Verified</span>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
          <div className="mb-16 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">Investment Tiers</h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Select an automated node to begin capital deployment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {RIO_PLANS.map((plan) => (
              <div 
                key={plan.key} 
                className={`relative bg-[#0a0c10] border ${plan.border} rounded-[2.5rem] p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden group`}
              >
                <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${plan.color} -z-0`} />
                
                <div className="relative z-10">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black">{plan.roi}</span>
                    <span className="text-[9px] font-black uppercase text-gray-500">Monthly</span>
                  </div>

                  <div className="space-y-4 mb-10">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-gray-600">Min Entry</span>
                      <span>€{plan.min.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-gray-600">Cycle</span>
                      <span>{plan.days} Days</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-10">
                    {['Audit Certified', 'Automated ROI', '24/7 Monitoring'].map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                        <CheckCircle2 size={12} className="text-indigo-500" /> {feat}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handleSelection(plan.key)}
                    className="w-full py-4 bg-white/5 hover:bg-white text-white hover:text-black font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Select Tier <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center shrink-0">
              <Info size={32} className="text-indigo-400" />
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-sm font-black uppercase tracking-widest mb-2">High-Frequency Trading Protocol</h4>
              <p className="text-xs text-gray-500 leading-relaxed max-w-3xl font-medium">
                Our proprietary nodes leverage real-time market data to optimize capital placement. Each tier represents a different risk-to-reward calibration within the Trustra Audit ecosystem. Returns are verified daily by the internal ledger.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

