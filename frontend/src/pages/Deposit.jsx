import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; // Updated for better React compatibility
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  PieChart,
  History,
  ArrowRightLeft,
  PlusCircle,
  Wallet,
  LogOut,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  ChevronLeft
} from 'lucide-react';

// ✅ Fixed: Importing directly from your centralized apiService
import api from '../api/apiService';

export default function Deposit() {
  const navigate = useNavigate();
  
  // State
  const [method, setMethod] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [deposit, setDeposit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Load Crypto Address
  const loadDeposit = useCallback(async (fresh = false) => {
    if (method === 'BANK') return;
    try {
      setLoading(true);
      // ✅ Using centralized api instance
      const res = await api.get(`/wallet/address/${method}${fresh ? '?fresh=true' : ''}`);
      setDeposit(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load deposit address');
    } finally {
      setLoading(false);
    }
  }, [method]);

  // Load History
  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get(`/transactions/my?type=deposit&asset=${method}`);
      setHistory(res.data?.transactions || []);
    } catch {
      console.error('History fetch failed');
    } finally {
      setHistoryLoading(false);
    }
  }, [method]);

  useEffect(() => {
    loadDeposit();
    loadHistory();
    const interval = setInterval(loadHistory, 60000);
    return () => clearInterval(interval);
  }, [loadDeposit, loadHistory]);

  const copyAddress = () => {
    if (!deposit?.address) return;
    navigator.clipboard.writeText(deposit.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Address copied to clipboard');
  };

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-white/5 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-500" />
          <span className="font-black text-xl tracking-tighter italic uppercase text-white">Trustra</span>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 rounded-xl transition uppercase text-[10px] font-black tracking-widest">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <div className="pt-8 pb-2 text-[9px] uppercase tracking-[0.2em] text-gray-600 px-3 font-black">Payments</div>
          <Link to="/deposit" className="flex items-center gap-3 p-3 bg-blue-600/10 text-blue-500 rounded-xl uppercase text-[10px] font-black tracking-widest">
            <PlusCircle size={18} /> Add Money
          </Link>
          <Link to="/withdraw" className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 rounded-xl transition uppercase text-[10px] font-black tracking-widest">
            <Wallet size={18} /> Withdraw
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <button onClick={() => navigate('/dashboard')} className="lg:hidden text-gray-400"><ChevronLeft /></button>
          <div className="hidden lg:block text-[10px] font-black text-gray-500 uppercase tracking-widest">Secure Gateway v8.4</div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition">
            Sign Out <LogOut size={16} />
          </button>
        </header>

        <main className="p-6 md:p-12 max-w-5xl w-full mx-auto space-y-10">
          <section className="space-y-2">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Add Money</h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Fund your Trustra Portfolio via 2026 Asset Directives.</p>
          </section>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {/* GATEWAY SELECTOR */}
              <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">Select Asset Gateway</label>
                <div className="flex flex-wrap gap-3">
                  {['BTC', 'ETH', 'USDT', 'LTC'].map((coin) => (
                    <button
                      key={coin}
                      onClick={() => setMethod(coin)}
                      className={`px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all ${
                        method === coin ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {coin}
                    </button>
                  ))}
                </div>

                {/* ADDRESS DISPLAY */}
                <div className="mt-10 space-y-6">
                  {loading ? (
                    <div className="flex flex-col items-center py-10 gap-4">
                      <Loader2 className="animate-spin text-blue-500" size={32} />
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Generating Node Address...</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex justify-center bg-white p-4 rounded-3xl w-fit mx-auto border-8 border-white/5">
                        <QRCodeSVG value={deposit?.address || 'Trustra'} size={180} level="H" />
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-center text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Personal {method} Deposit Address</p>
                        <div className="relative group">
                          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 pr-16 font-mono text-xs text-blue-400 break-all leading-relaxed">
                            {deposit?.address || 'Address not available'}
                          </div>
                          <button 
                            onClick={copyAddress}
                            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-500 transition-all active:scale-90"
                          >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex gap-4">
                        <AlertCircle className="text-blue-500 shrink-0" size={20} />
                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                          Deposits sent to this address will be credited after <span className="text-white font-bold">3 network confirmations</span>. 
                          Ensure you are using the <span className="text-blue-400 font-bold">{method} Network</span>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* HISTORY SIDEBAR */}
            <div className="space-y-6">
              <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
                <History className="text-blue-500" size={18} /> Recent Deposits
              </h3>
              <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
                {historyLoading ? (
                  <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-gray-700" /></div>
                ) : history.length > 0 ? (
                  history.map((tx, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <p className="text-[10px] font-black text-white italic">{tx.asset || method}</p>
                        <p className="text-[9px] text-gray-500 font-bold">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-emerald-500">+{tx.amount}</p>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${tx.status === 'completed' ? 'text-emerald-500/50' : 'text-blue-500/50'}`}>{tx.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-10 text-[10px] font-black text-gray-700 uppercase tracking-widest">No history found</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

