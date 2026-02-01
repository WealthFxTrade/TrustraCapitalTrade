import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserAccount, getBtcPrice } from '../api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ balance: 0, profit: 0 });
  const [btcPrice, setBtcPrice] = useState('0.00');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [acc, btc] = await Promise.all([getUserAccount(), getBtcPrice()]);
        setStats(acc.data);
        setBtcPrice(btc.data.price || btc.data.bitcoin?.usd); // Handling different API structures
      } catch (err) {
        toast.error("Failed to sync real-time data");
      }
    };
    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <nav className="flex justify-between items-center mb-10 border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-blue-500">Trustra Dashboard</h1>
        <button onClick={logout} className="text-sm bg-red-600/20 text-red-500 px-4 py-2 rounded hover:bg-red-600/30 transition">Logout</button>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-400 text-sm">Main Balance</p>
          <h2 className="text-3xl font-bold">${stats.balance?.toLocaleString()}</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-400 text-sm">Live BTC Price</p>
          <h2 className="text-3xl font-bold text-orange-500">${Number(btcPrice).toLocaleString()}</h2>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-6">Investment ROI Plans</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { n: 'Starter', r: 5, m: 500 },
          { n: 'Growth', r: 12, m: 5000 },
          { n: 'Pro', r: 25, m: 20000 },
          { n: 'Institutional', r: 35, m: 50000 },
          { n: 'Elite', r: 50, m: 100000 }
        ].map((plan) => (
          <div key={plan.n} className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-blue-500 transition group">
            <h4 className="font-bold text-blue-400">{plan.n}</h4>
            <p className="text-2xl font-bold my-2">{plan.r}% ROI</p>
            <p className="text-xs text-slate-500 mb-4">Min Deposit: ${plan.m.toLocaleString()}</p>
            <button className="w-full bg-blue-600 group-hover:bg-blue-500 py-2 rounded text-sm font-bold">Invest Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}

