import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, LayoutDashboard, History, ShieldCheck,
  LogOut, Clock, CheckCircle2, AlertCircle, RefreshCw, Zap
} from 'lucide-react';
import api from '../api/api'; // ✅ FIXED: Using the standard api.js instance

export default function SchemaLogs({ logout }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // ✅ FIXED: Matches your backend dashboard-stats route
        const res = await api.get('/user/dashboard-stats');
        
        // Target active investments. If your backend uses 'transactions' with a type filter:
        const activeOnly = res.data.transactions?.filter(tx => 
          tx.type === 'investment' || tx.description.toLowerCase().includes('plan')
        ) || [];
        
        setLogs(activeOnly);
      } catch (err) {
        console.error("Failed to fetch Trustra logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white font-sans selection:bg-indigo-500/30">
      
      {/* SIDEBAR - Matches your Dashboard.jsx look */}
      <aside className="w-72 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen p-6 space-y-8">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Zap size={22} className="text-white fill-current" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">TrustraCapital</span>
        </div>

        <nav className="space-y-1">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 px-3">Main Menu</p>
          <Link to="/dashboard" className="flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-500 hover:bg-white/5 hover:text-white transition-all group">
            <LayoutDashboard size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">DASHBOARD</span>
          </Link>
          <Link to="/plans" className="flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-500 hover:bg-white/5 hover:text-white transition-all group">
            <Zap size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">ALL SCHEMA</span>
          </Link>
          <Link to="/investments" className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 transition-all">
            <History size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">SCHEMA LOGS</span>
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-xl flex items-center justify-end px-8 sticky top-0 z-40">
          <button onClick={logout} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
            Logout <LogOut size={14} className="inline ml-2" />
          </button>
        </header>

        <main className="p-8 lg:p-12 max-w-7xl w-full mx-auto space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em]">Network Secure</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">Schema <span className="text-slate-800">/</span> Logs</h1>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Real-time status of your 2026 Rio Series Portfolio</p>
            </div>
            <button onClick={() => window.location.reload()} className="h-12 w-12 flex items-center justify-center bg-white/5 rounded-2xl text-gray-400 hover:text-white transition-all border border-white/10 active:scale-95">
              <RefreshCw size={20} />
            </button>
          </div>

          {/* ACTIVE INVESTMENTS TABLE */}
          <div className="bg-[#0f1218] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="bg-white/5 text-[9px] text-gray-500 uppercase tracking-[0.3em]">
                  <tr>
                    <th className="px-10 py-6 font-black">Schema Node</th>
                    <th className="px-10 py-6 font-black text-center">Capital (€)</th>
                    <th className="px-10 py-6 font-black text-center">Yield (ROI)</th>
                    <th className="px-10 py-6 font-black text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-10 py-32 text-center">
                        <div className="flex flex-col items-center gap-4">
                           <RefreshCw className="animate-spin text-indigo-500" size={32} />
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Syncing Trustra Nodes...</span>
                        </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-10 py-32 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <AlertCircle size={48} className="text-gray-600" />
                          <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Active Capital Schemas Detected</p>
                          <Link to="/plans" className="mt-6 px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">Open New Node</Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-indigo-600/[0.03] transition-colors group">
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                 <Zap size={18} />
                              </div>
                              <span className="font-black text-white text-base uppercase italic tracking-tighter">
                                {log.description}
                              </span>
                           </div>
                        </td>
                        <td className="px-10 py-8 font-mono font-bold text-gray-400 text-center text-lg">
                          €{Number(log.amount).toLocaleString()}
                        </td>
                        <td className="px-10 py-8 text-emerald-400 font-mono font-black text-center text-xl">
                          +{log.type === 'investment' ? 'Active' : 'Live'}
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={12} /> Operational
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

