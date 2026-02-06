import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, PieChart, History, ArrowRightLeft, 
  PlusCircle, Wallet, ChevronRight, CheckCircle2, TrendingUp, 
  LogOut, Copy, Check, RefreshCw, Loader2, AlertCircle
} from 'lucide-react';

import {
  getDepositAddress,
  getDepositHistory,
  createFiatDeposit,
} from '../api';

export default function Deposit({ logout }) {
  const navigate = useNavigate();

  // State
  const [method, setMethod] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [deposit, setDeposit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Logic: Load Crypto Address
  const loadDeposit = useCallback(async (fresh = false) => {
    try {
      setLoading(true);
      const res = await getDepositAddress(method, fresh);
      setDeposit(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load deposit address');
    } finally {
      setLoading(false);
    }
  }, [method]);

  // Logic: Load History
  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await getDepositHistory(method);
      setHistory(res.data || []);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }, [method]);

  useEffect(() => {
    if (method !== 'BANK') loadDeposit();
    loadHistory();
    const interval = setInterval(loadHistory, 60000);
    return () => clearInterval(interval);
  }, [loadDeposit, loadHistory, method]);

  const copyAddress = () => {
    navigator.clipboard.writeText(deposit.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success('Address copied!');
  };

  const submitFiat = async (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value < 100) return toast.error('Minimum deposit is €100');

    try {
      setLoading(true);
      await createFiatDeposit({ amount: value, method });
      toast.success('Deposit request submitted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0d14] text-white font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0f121d] border-r border-gray-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-800 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-lg tracking-tight text-white">TrustraCapital</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm text-gray-400">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] font-bold tracking-widest">
            <LayoutDashboard size={18} /> DASHBOARD
          </Link>
          <div className="pt-6 pb-2 text-[10px] uppercase tracking-widest text-gray-600 px-3 font-bold">Payments</div>
          <Link to="/deposit" className="flex items-center gap-3 p-3 bg-indigo-600/10 text-indigo-400 rounded-lg uppercase text-[11px] font-bold tracking-widest">
            <PlusCircle size={18} /> ADD MONEY
          </Link>
          <Link to="/transactions" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] font-bold tracking-widest">
            <History size={18} /> ALL TRANSACTIONS
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-800 bg-[#0f121d]/80 flex items-center justify-end px-8">
          <button onClick={logout} className="text-gray-400 hover:text-red-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            Logout <LogOut size={16} />
          </button>
        </header>

        <main className="p-8 max-w-5xl w-full mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Add Money</h1>
            <p className="text-gray-500 text-sm">Fund your Trustra Account via Crypto or Bank Transfer.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              {/* METHOD SELECTOR */}
              <div className="bg-[#161b29] border border-gray-800 rounded-2xl p-6">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Select Gateway</label>
                <div className="grid grid-cols-3 gap-3">
                  {['BTC', 'USDT', 'BANK'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        method === m ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-800 bg-[#0f121d] text-gray-500'
                      }`}
                    >
                      {m === 'BANK' ? 'Bank Transfer' : m}
                    </button>
                  ))}
                </div>
              </div>

              {/* DYNAMIC PAYMENT AREA */}
              <div className="bg-[#161b29] border border-gray-800 rounded-2xl p-8 shadow-xl">
                {method === 'BANK' ? (
                  <form onSubmit={submitFiat} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Amount (€)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Min €100"
                        className="w-full bg-[#0f121d] border border-gray-800 rounded-xl p-4 text-white font-bold focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition">
                      {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Deposit'}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-6">
                    {loading ? (
                       <div className="py-12"><RefreshCw className="animate-spin text-indigo-500" size={32} /></div>
                    ) : deposit ? (
                      <>
                        <div className="bg-white p-3 rounded-2xl">
                          <QRCode value={deposit.address} size={180} />
                        </div>
                        <div className="w-full space-y-2 text-left">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Your Personal {method} Address</label>
                          <div className="flex items-center gap-2 bg-[#0f121d] border border-gray-800 p-4 rounded-xl">
                            <span className="truncate flex-1 font-mono text-xs text-indigo-400">{deposit.address}</span>
                            <button onClick={copyAddress} className="text-gray-400 hover:text-white">
                              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                            </button>
                          </div>
                        </div>
                        <div className="flex w-full gap-4">
                           <button onClick={() => loadDeposit(true)} className="flex-1 bg-gray-800 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                             <RefreshCw size={14} /> New Address
                           </button>
                           <div className="flex-1 bg-indigo-500/10 border border-indigo-500/20 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center justify-center">
                             Status: {deposit.status}
                           </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* SIDEBAR INFO & HISTORY */}
            <div className="space-y-6">
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6">
                <AlertCircle className="text-indigo-500 mb-4" size={24} />
                <h4 className="font-bold text-sm mb-2 uppercase tracking-tight">Payment Notice</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Please send only <strong>{method}</strong> to this address. Sending any other coin will result in permanent loss.
                </p>
              </div>

              <div className="bg-[#161b29] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 font-black text-[10px] uppercase tracking-widest text-gray-500">History</div>
                <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
                  {historyLoading ? (
                    <div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-gray-600" /></div>
                  ) : history.length === 0 ? (
                    <p className="text-[11px] text-gray-600 text-center py-4 italic">No recent deposits.</p>
                  ) : (
                    history.map((d) => (
                      <div key={d._id} className="flex justify-between items-center bg-[#0f121d] p-3 rounded-xl border border-gray-800/50">
                        <div>
                          <p className="text-[11px] font-bold italic">€{d.amount}</p>
                          <p className="text-[9px] text-gray-600 uppercase tracking-tighter">{new Date(d.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${d.status === 'completed' ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                          {d.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

