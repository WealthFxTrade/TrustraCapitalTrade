import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardSkeleton } from '../../components/Skeleton';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { 
  TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, 
  BarChart3, Clock, ShieldCheck, Zap, X 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btcPrice, setBtcPrice] = useState(null);
  
  // Modal & Form States
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- DATA FETCHING ENGINE ---
  const fetchAllData = async () => {
    try {
      const [statsRes, btcRes] = await Promise.all([
        api.get('/user/dashboard-stats'),
        fetch('https://api.coingecko.com')
      ]);
      const btcData = await btcRes.json();
      
      setStats(statsRes.data);
      if (btcData?.bitcoin?.eur) setBtcPrice(btcData.bitcoin.eur);
    } catch (err) {
      console.error("Terminal Sync Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000); 
    return () => clearInterval(interval);
  }, []);

  // --- WITHDRAWAL LOGIC ---
  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (Number(withdrawAmount) > stats?.balance) return toast.error('Insufficient Liquidity');
    
    setIsSubmitting(true);
    try {
      await api.post('/transactions/withdraw', { amount: withdrawAmount });
      toast.success(`Withdrawal of €${withdrawAmount} Initiated`);
      setShowWithdraw(false);
      setWithdrawAmount('');
      fetchAllData(); // Refresh ledger and balance immediately
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-8 bg-[#05070a] min-h-screen"><DashboardSkeleton /></div>
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 md:p-8 selection:bg-blue-500/30 relative">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em]">Network Secure</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Terminal <span className="text-slate-700">/</span> {user?.name?.split(' ')[0] || 'Investor'}
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-xl shadow-2xl">
          <div className="text-right">
            <p className="text-[9px] uppercase text-slate-500 font-black tracking-widest mb-1">Live BTC/EUR</p>
            <span className="font-mono text-xl text-blue-400 font-bold">
              €{btcPrice?.toLocaleString() || '---'}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-white/10 mx-2" />
          <Zap size={20} className="text-amber-400 animate-bounce" />
        </div>
      </header>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Net Liquidity" 
          value={`€${stats?.balance?.toLocaleString() || '0.00'}`} 
          icon={<Wallet className="text-blue-500" />}
          trend="+4.2%" isUp={true}
        />
        <StatCard 
          title="Active Positions" 
          value={stats?.activeDeals || '0'} 
          icon={<TrendingUp className="text-purple-500" />}
          trend="Live" 
        />
        <StatCard 
          title="Total Yield" 
          value={`€${stats?.profit?.toLocaleString() || '0.00'}`} 
          icon={<BarChart3 className="text-emerald-500" />}
          trend="+18.4%" isUp={true}
        />
      </div>

      {/* --- LEDGER & SIDEBAR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
          <h3 className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3 mb-8">
            <Clock size={16} className="text-blue-500" /> Transaction Ledger
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-600 font-black">
                  <th className="px-6 pb-2">Description</th>
                  <th className="px-6 pb-2 text-center">Status</th>
                  <th className="px-6 pb-2 text-right">Delta (EUR)</th>
                </tr>
              </thead>
              <tbody>
                {stats?.transactions?.length > 0 ? (
                  stats.transactions.map((tx, i) => (
                    <tr key={i} className="group cursor-default">
                      <td className="bg-black/40 group-hover:bg-blue-500/10 transition-colors rounded-l-2xl px-6 py-5 border-l border-t border-b border-white/5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white italic">{tx.description}</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase mt-1">{new Date(tx.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="bg-black/40 group-hover:bg-blue-500/10 transition-colors px-6 py-5 border-t border-b border-white/5 text-center">
                        <span className={`text-[9px] px-3 py-1 rounded-md font-black uppercase tracking-widest border ${
                          tx.status === 'completed' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-amber-500/20 text-amber-500 bg-amber-500/5'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="bg-black/40 group-hover:bg-blue-500/10 transition-colors rounded-r-2xl px-6 py-5 border-r border-t border-b border-white/5 text-right font-mono">
                        <span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-blue-400' : 'text-slate-400'}`}>
                          {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="py-20 text-center text-slate-700 text-[10px] uppercase font-black tracking-[0.5em]">No Data Detected</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- SIDEBAR --- */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <ShieldCheck className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12" />
            <h3 className="text-white font-black uppercase tracking-tighter text-2xl italic leading-tight">Capital<br/>Control</h3>
            <p className="text-blue-100 text-[11px] mt-4 leading-relaxed font-medium opacity-80">
              Withdrawal Limit: <span className="text-white font-bold underline">€50,000.00</span> per day.
            </p>
            <button 
              onClick={() => setShowWithdraw(true)}
              className="mt-8 w-full bg-white text-blue-600 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-xl"
            >
              Withdraw Funds
            </button>
          </div>
        </div>
      </div>

      {/* --- WITHDRAWAL MODAL --- */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/70">
          <div className="bg-[#0a0c10] border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => setShowWithdraw(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={20} /></button>
            
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-white">Secure Outflow</h2>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-8">Verification Level: Tier 1 Required</p>

            <form onSubmit={handleWithdraw} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Amount (EUR)</label>
                <input 
                  type="number" placeholder="0.00"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white font-mono outline-none focus:border-blue-500 transition-all"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                />
                <p className="text-[9px] text-slate-600 mt-2 italic font-bold">Max Available: €{stats?.balance?.toLocaleString()}</p>
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <p className="text-[9px] text-blue-400 font-bold leading-relaxed uppercase">Process: SEPA Instant Terminal</p>
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 flex justify-center"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, trend, isUp }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-7 backdrop-blur-md hover:border-blue-500/40 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-black/40 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-md ${isUp ? 'text-green-400 bg-green-400/10' : 'text-slate-500 bg-slate-500/10'}`}>
            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {trend}
          </div>
        )}
      </div>
      <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">{title}</p>
      <h2 className="text-3xl font-black mt-2 font-mono tracking-tighter text-white italic">{value}</h2>
    </div>
  );
}

