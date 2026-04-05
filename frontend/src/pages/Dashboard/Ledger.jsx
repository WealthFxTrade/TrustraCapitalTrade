// src/pages/Dashboard/Ledger.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, History, CheckCircle2, Clock, XCircle, 
  Loader2, ShieldCheck, LogOut, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Ledger() {
  const { logout, isAuthenticated, initialized } = useAuth();
  const navigate = useNavigate();                                     
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Fetch Fresh Transaction Logs from the Backend
   */
  const fetchLedger = useCallback(async (showLoader = true) => {          
    if (showLoader) setLoading(true);                                     
    else setIsRefreshing(true);

    try {                                                       
      // Hits the /api/users/transactions endpoint
      const res = await api.get(API_ENDPOINTS.USER.TRANSACTIONS);

      // Robust check for data structure: supports both flat arrays or { transactions: [] }
      const data = Array.isArray(res.data) 
        ? res.data 
        : (res.data?.transactions || []);
        
      setTransactions(data);
    } catch (err) {
      console.error("Ledger Sync Error:", err);
      toast.error('Audit Log Sync Failed');
    } finally {                                                              
      setLoading(false);
      setIsRefreshing(false);                                              
    }
  }, []);

  useEffect(() => {
    if (initialized) {
      if (!isAuthenticated) {
        navigate('/login');
      } else {
        fetchLedger();                                                  
      }
    }
  }, [initialized, isAuthenticated, navigate, fetchLedger]);

  /**
   * Formats numbers based on the asset class (Fiat vs Crypto)
   */
  const formatCurrency = (amount, currency = 'EUR') => {
    const isBTC = currency.toUpperCase() === 'BTC';
    return new Intl.NumberFormat('de-DE', {                                   
      style: 'currency',
      currency: isBTC ? 'BTC' : 'EUR',
      minimumFractionDigits: isBTC ? 8 : 2     
    }).format(amount || 0);
  };

  /**
   * Generates themed status badges for the audit table
   */
  const getStatusBadge = (status) => {                                     
    const s = (status || 'pending').toLowerCase();                        
    const baseClass = "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border";
    
    switch(s) {
      case 'completed':
      case 'confirmed':
      case 'success':                                                                       
        return (
          <span className={`${baseClass} bg-emerald-500/10 border-emerald-500/30 text-emerald-400`}>
            <CheckCircle2 size={12} /> Confirmed
          </span>
        );                                                                    
      case 'pending':
      case 'processing':
        return (
          <span className={`${baseClass} bg-amber-500/10 border-amber-500/30 text-amber-400`}>
            <Clock size={12} className="animate-pulse" /> Pending
          </span>
        );                                                                       
      default:
        return (
          <span className={`${baseClass} bg-rose-500/10 border-rose-500/30 text-rose-400`}>
            <XCircle size={12} /> Failed
          </span>
        );            
    }
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>                                                              
    );
  }                                                                    
  
  return (
    <div className="flex min-h-screen bg-[#020408] text-white overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex w-80 bg-[#0a0c10] border-r border-white/5 p-8 flex-col h-screen">
        <div className="flex items-center gap-3 mb-16 cursor-pointer" onClick={() => navigate('/dashboard')}>                                          
          <ShieldCheck className="text-emerald-500" size={32} />
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Trustra</h1>
        </div>
        <nav className="flex-1 space-y-2">                                      
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all w-full text-left"
          >
            <LayoutDashboard size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Portfolio</span>
          </button>
          <button className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-emerald-600 text-black shadow-lg w-full text-left">                       
            <History size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Audit History</span>
          </button>
        </nav>
        <button onClick={logout} className="mt-auto flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-rose-400 transition-all">
          <LogOut size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">End Session</span>
        </button>
      </aside>

      {/* Main Audit Content */}
      <main className="flex-1 overflow-y-auto h-screen p-6 lg:p-12 space-y-8">
        <header className="flex justify-between items-center">                  
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase italic">Ledger Audit</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Institutional Node Transaction History</p>                        
          </div>
          <button                                                                                 
            onClick={() => fetchLedger(false)}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
          >                                                                                       
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> Refresh Logs
          </button>
        </header>                                                     
        
        <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>                                                                                 
                <tr className="border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="px-8 py-6">Date & Timestamp</th>                        
                  <th className="px-8 py-6">Description</th>
                  <th className="px-8 py-6 text-right">Amount (Net)</th>
                  <th className="px-8 py-6 text-center">Status</th>                    
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {transactions.length > 0 ? (                                                               
                    transactions.map((tx) => (                                                                
                      <motion.tr
                        key={tx._id}                                                                          
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hover:bg-white/[0.02] transition-all group"
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <p className="text-xs font-black text-white italic">
                            {new Date(tx.createdAt).toLocaleDateString('de-DE')}
                          </p>
                          <p className="text-[9px] text-gray-500 font-mono mt-1">                                                                                                                                                 
                            {new Date(tx.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-black text-white uppercase group-hover:text-emerald-500 transition-colors">
                            {tx.description || tx.type}                                                                         
                          </p>
                          <p className="text-[9px] text-gray-500 font-mono mt-1 uppercase tracking-tighter">
                            Ref: {tx.txHash || tx._id?.toString().slice(-12)}                                                                                                                                                                       
                          </p>                                                                                
                        </td>
                        <td className={`px-8 py-6 text-right font-black italic text-sm ${tx.signedAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.signedAmount >= 0 ? '+' : ''}{formatCurrency(tx.amount, tx.currency || 'EUR')}
                        </td>
                        <td className="px-8 py-6 flex justify-center">                          
                          {getStatusBadge(tx.status)}                                                                         
                        </td>
                      </motion.tr>
                    ))                                                                                  
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <History size={48} />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em]">No node activity found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>                                                                             
        </div>
      </main>
    </div>
  );
}
