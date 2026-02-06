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
        const res = await api.get('/user/dashboard'); // Or your specific logs endpoint
        // Assuming your backend sends active plans in a 'logs' or 'activeInvestments' array
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
    <div className="flex min-h-screen bg-[#0a0d14] text-white font-sans">
      
      {/* SIDEBAR */}
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
          <Link to="/plans" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] font-bold tracking-widest">
            <ShieldCheck size={18} /> ALL SCHEMA
          </Link>
          <Link to="/logs" className="flex items-center gap-3 bg-indigo-600/10 text-indigo-400 p-3 rounded-lg uppercase text-[11px] font-bold tracking-widest">
            <History size={18} /> SCHEMA LOGS
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-800 bg-[#0f121d]/80 flex items-center justify-end px-8">
          <button onClick={logout} className="text-gray-400 hover:text-red-400 text-[10px] font-black uppercase tracking-widest">
            Logout <LogOut size={16} className="inline ml-2" />
          </button>
        </header>

        <main className="p-8 max-w-6xl w-full mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold">Schema Logs</h1>
              <p className="text-gray-500 text-sm">Real-time status of your active TrustraCapitalTrade investments.</p>
            </div>
            <button onClick={() => window.location.reload()} className="bg-gray-800 p-2 rounded-lg text-gray-400 hover:text-white transition">
              <RefreshCw size={18} />
            </button>
          </div>

          {/* ACTIVE INVESTMENTS TABLE */}
          <div className="bg-[#161b29] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0f121d] text-[10px] text-gray-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-5 font-black">Schema Name</th>
                  <th className="px-6 py-5 font-black">Invested Amount</th>
                  <th className="px-6 py-5 font-black">Total ROI</th>
                  <th className="px-6 py-5 font-black">Next Profit</th>
                  <th className="px-6 py-5 font-black text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <RefreshCw className="animate-spin inline mr-2 text-indigo-500" /> Syncing with Trustra Nodes...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={40} className="text-gray-700" />
                        <p className="text-gray-500 font-bold italic uppercase tracking-tighter">No active investment schema found.</p>
                        <Link to="/plans" className="text-indigo-400 text-xs font-black uppercase underline mt-2">Start Investing Now</Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/30 transition-colors group">
                      <td className="px-6 py-6 font-bold text-white uppercase tracking-tight">
                        {log.planName}
                      </td>
                      <td className="px-6 py-6 font-black text-indigo-400">
                        €{log.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-6 text-green-400 font-bold">
                        +€{log.totalProfit.toLocaleString()}
                      </td>
                      <td className="px-6 py-6 text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-indigo-500" />
                          <span>{log.nextReturn || 'Calculating...'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                          Running
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* SUMMARY WIDGET */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#161b29] border-l-4 border-indigo-500 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
                <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-500">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Contracts</p>
                   <h4 className="text-xl font-bold">{logs.length} Total Plans</h4>
                </div>
            </div>
            <div className="bg-[#161b29] border-l-4 border-green-500 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
                <div className="bg-green-500/10 p-3 rounded-xl text-green-500">
                  <TrendingUp size={24} />
                </div>
                <div>
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Estimated Yield</p>
                   <h4 className="text-xl font-bold text-green-400">ROI Processing</h4>
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

