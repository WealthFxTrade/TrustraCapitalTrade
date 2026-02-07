import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, LayoutDashboard, History, ShieldCheck,
  LogOut, Clock, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import api from '../api/apiService';

export default function SchemaLogs({ logout }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/user/dashboard');
        // Targets the active investments array populated by your backend controller
        setLogs(res.data.stats.activeInvestments || []);
      } catch (err) {
        console.error("Failed to fetch Trustra logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0d14] text-white font-sans selection:bg-indigo-500/30">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0f121d] border-r border-gray-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-800 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-indigo-500" />
          <span className="font-black text-xl tracking-tighter italic uppercase">Trustra</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-gray-800/50 text-gray-400 rounded-lg transition uppercase text-[10px] font-bold tracking-[0.2em]">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <div className="pt-6 pb-2 text-[9px] uppercase tracking-[0.3em] text-gray-600 px-3 font-black">Investments</div>
          <Link to="/plans" className="flex items-center gap-3 p-3 hover:bg-gray-800/50 text-gray-400 rounded-lg transition uppercase text-[10px] font-bold tracking-[0.2em]">
            <ShieldCheck size={18} /> All Schema
          </Link>
          <Link to="/logs" className="flex items-center gap-3 bg-indigo-600/10 text-indigo-400 p-3 rounded-lg uppercase text-[10px] font-bold tracking-[0.2em]">
            <History size={18} /> Schema Logs
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-gray-800 bg-[#0f121d]/80 backdrop-blur-xl flex items-center justify-end px-8 sticky top-0 z-40">
          <button onClick={logout} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
            Logout <LogOut size={14} className="inline ml-2" />
          </button>
        </header>

        <main className="p-8 lg:p-12 max-w-7xl w-full mx-auto space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase italic">Schema Logs</h1>
              <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest text-[10px] font-bold">Real-time status of your 2026 Rio Series Portfolio</p>
            </div>
            <button onClick={() => window.location.reload()} className="h-12 w-12 flex items-center justify-center bg-gray-800 rounded-2xl text-gray-400 hover:text-white transition-all shadow-xl active:scale-95 border border-white/5">
              <RefreshCw size={20} />
            </button>
          </div>

          {/* ACTIVE INVESTMENTS TABLE */}
          <div className="bg-[#161b29] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0f121d] text-[9px] text-gray-500 uppercase tracking-[0.3em] border-b border-gray-800">
                  <tr>
                    <th className="px-10 py-6 font-black">Schema Name</th>
                    <th className="px-10 py-6 font-black text-center">Principal</th>
                    <th className="px-10 py-6 font-black text-center">Yield (ROI)</th>
                    <th className="px-10 py-6 font-black text-center">Maturity</th>
                    <th className="px-10 py-6 font-black text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-10 py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                           <RefreshCw className="animate-spin text-indigo-500" size={32} />
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Syncing Trustra Nodes...</span>
                        </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-10 py-32 text-center">
                        <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                          <AlertCircle size={48} className="text-gray-800" />
                          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No active investment schema found in your current portfolio.</p>
                          <Link to="/plans" className="mt-4 px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">Start Investing</Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-indigo-600/[0.03] transition-colors group">
                        <td className="px-10 py-8 font-black text-white text-sm uppercase italic tracking-tighter">
                          {log.planName}
                        </td>
                        <td className="px-10 py-8 font-mono font-bold text-gray-300 text-center">
                          €{Number(log.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-10 py-8 text-green-400 font-mono font-black text-center text-lg">
                          +€{Number(log.totalProfit).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-10 py-8 text-center">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-xl border border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Clock size={12} className="text-indigo-500" />
                            <span>{log.nextReturn || 'Processing'}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            Operational
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SUMMARY WIDGET */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#161b29] border-l-4 border-indigo-500 p-8 rounded-[2rem] flex items-center gap-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><CheckCircle2 size={100} /></div>
                <div className="bg-indigo-500/10 h-16 w-16 flex items-center justify-center rounded-2xl text-indigo-500 border border-indigo-500/20">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Contract Audit</p>
                   <h4 className="text-2xl font-black italic">{logs.length} Active Plan{logs.length !== 1 ? 's' : ''}</h4>
                </div>
            </div>
            <div className="bg-[#161b29] border-l-4 border-green-500 p-8 rounded-[2rem] flex items-center gap-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp size={100} /></div>
                <div className="bg-green-500/10 h-16 w-16 flex items-center justify-center rounded-2xl text-green-500 border border-green-500/20">
                  <TrendingUp size={32} />
                </div>
                <div>
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Yield Projection</p>
                   <h4 className="text-2xl font-black italic text-green-400">Audited Daily ROI</h4>
                </div>
            </div>
          </div>
        </main>
        <footer className="py-10 text-center">
           <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.4em] italic">© 2016-2026 Trustra Capital Trade Global Inc. • EUR Base Currency Standard</p>
        </footer>
      </div>
    </div>
  );
}

