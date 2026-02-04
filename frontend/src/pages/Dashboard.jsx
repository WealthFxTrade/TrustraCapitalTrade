import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Use the unified api engine we built in src/api/index.js
import { api, getUserBalance } from '../api'; 
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Wallet,
  LogOut,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const RIO_PLANS = [
  { id: 'starter', name: 'Rio Starter', roi: '6–9', min: 100, max: 999 },
  { id: 'basic', name: 'Rio Basic', roi: '9–12', min: 1000, max: 4999 },
  { id: 'standard', name: 'Rio Standard', roi: '12–16', min: 5000, max: 14999 },
  { id: 'advanced', name: 'Rio Advanced', roi: '16–20', min: 15000, max: 49999 },
  { id: 'elite', name: 'Rio Elite', roi: '20–25', min: 50000, max: Infinity },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ balance: 0, profit: 0 });
  const [btcPrice, setBtcPrice] = useState('77494'); 
  const [syncing, setSyncing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        /**
         * 1. API CALLS
         * Using the normalized 'api' instance ensures /api prefix and 
         * Bearer token are correctly handled.
         */
        const [accResponse, btcResponse] = await Promise.all([
          api.get('/user/balance'), 
          api.get('/market/btc-price') // Ensure this route exists on your backend
        ]);

        setStats(accResponse.data);
        
        const currentPrice = btcResponse.data.price || btcResponse.data.bitcoin?.usd;
        if (currentPrice) setBtcPrice(currentPrice);
      } catch (err) {
        // If it's a 401, the Axios interceptor will handle the logout automatically
        console.warn('Market sync failed. Using fallback price.');
      } finally {
        setSyncing(false);
      }
    };

    loadDashboard();
    const interval = setInterval(loadDashboard, 300000); 
    return () => clearInterval(interval);
  }, []);

  const handlePlanClick = (plan) => {
    // Persistent selection for the investment page
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    navigate('/invest');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-4 md:px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight">Trustra Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Active User</p>
              <p className="text-sm font-medium">{user?.fullName || 'Investor'}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-xs bg-red-500/10 text-red-500 px-4 py-2 rounded-lg font-bold hover:bg-red-500/20 transition border border-red-500/20"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                <Wallet className="h-6 w-6" />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Available Balance</p>
            </div>
            <h2 className="text-4xl font-bold font-mono">
              ${(stats.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">BTC Market Price</p>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-bold font-mono text-orange-400">
                ${Number(btcPrice).toLocaleString()}
              </h2>
              <span className="text-xs text-slate-600 font-bold">USD/BTC</span>
            </div>
          </div>
        </div>

        <div className="mb-8 flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-bold mb-1 text-white">Investment ROI Plans</h3>
            <p className="text-slate-500 text-sm">Select a plan to start generating automated returns.</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            <ShieldCheck className="h-3 w-3 text-indigo-500" /> Secure Plans
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {RIO_PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handlePlanClick(plan)}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500 hover:bg-indigo-500/5 cursor-pointer transition-all hover:-translate-y-2 group shadow-lg"
            >
              <h4 className="font-bold text-indigo-400 text-sm uppercase tracking-widest mb-4">{plan.name}</h4>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-extrabold">{plan.roi}%</span>
                <span className="text-slate-500 text-[10px] font-bold">ROI</span>
              </div>
              <div className="space-y-1 mb-6">
                <p className="text-[10px] text-slate-400 font-medium">MIN: ${plan.min.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-medium">
                  MAX: {plan.max === Infinity ? 'UNLIMITED' : `$${plan.max.toLocaleString()}`}
                </p>
              </div>
              <button className="w-full bg-indigo-600 group-hover:bg-indigo-500 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
                Invest Now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto p-8 border-t border-slate-900 mt-10">
        <p className="text-center text-[10px] text-slate-600 font-bold tracking-[0.2em] uppercase">
          © 2016–2026 Trustra Capital Trade • System Status: {syncing ? 'Syncing...' : 'Encrypted'}
        </p>
      </footer>
    </div>
  );
}

