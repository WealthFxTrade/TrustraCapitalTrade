import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  X, Shield, CreditCard, Activity, 
  ArrowDownLeft, ArrowUpRight, Lock, 
  MapPin, Clock, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminAuditView({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        // Specialized endpoint to get full user history
        const { data } = await api.get(`/admin/users/${userId}/audit`);
        setData(data);
      } catch (err) {
        toast.error("Audit Interrupted: Node data unreachable");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserDetails();
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Slide-over Panel */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-2xl h-full bg-[#05070a] border-l border-white/10 shadow-2xl flex flex-col"
      >
        {/* PANEL HEADER */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Node Investigation</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target ID: {userId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-rose-500 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Decrypting Node History...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            
            {/* 1. FINANCIAL SUMMARY */}
            <section>
              <h3 className="text-[10px] font-black uppercase text-gray-600 tracking-[0.4em] mb-4">Capital Allocation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Primary Balance</p>
                  <p className="text-2xl font-black italic text-white">€{data.user.balances.EUR?.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Yield Balance</p>
                  <p className="text-2xl font-black italic text-rose-500">€{data.user.balances.EUR_PROFIT?.toLocaleString()}</p>
                </div>
              </div>
            </section>

            

            {/* 2. SECURITY & LOGINS */}
            <section>
              <h3 className="text-[10px] font-black uppercase text-gray-600 tracking-[0.4em] mb-4">Access Logs</h3>
              <div className="space-y-3">
                {data.logins?.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Clock size={14} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white">{new Date(log.timestamp).toLocaleString()}</p>
                        <p className="text-[9px] text-gray-500 flex items-center gap-1 font-mono uppercase">
                          <MapPin size={8} /> {log.ipAddress} • {log.userAgent.substring(0, 20)}...
                        </p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded">Success</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. RECENT TRANSACTIONS */}
            <section>
              <h3 className="text-[10px] font-black uppercase text-gray-600 tracking-[0.4em] mb-4">Ledger Activity</h3>
              <div className="space-y-2">
                {data.transactions?.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.04] rounded-2xl transition-all border border-transparent hover:border-white/5 group">
                    <div className="flex items-center gap-4">
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft size={18} className="text-emerald-500" />
                      ) : (
                        <ArrowUpRight size={18} className="text-rose-500" />
                      )}
                      <div>
                        <p className="text-xs font-black uppercase text-white">{tx.type}</p>
                        <p className="text-[9px] text-gray-500 font-bold">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-black ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}€{tx.amount.toLocaleString()}
                      </p>
                      <p className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ACTIONS FOOTER */}
        <div className="p-8 bg-white/[0.02] border-t border-white/5 grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            <Lock size={14} /> Reset 2FA
          </button>
          <button className="flex items-center justify-center gap-2 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-900/40">
            <Activity size={14} /> Send Alert
          </button>
        </div>
      </motion.div>
    </div>
  );
}
