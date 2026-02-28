// src/pages/AdminDeposits.jsx - Production v8.4.1
import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, Clock, RefreshCw, Search, 
  Wallet, ArrowLeft, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api'; // Using your centralized axios instance
import toast from 'react-hot-toast';

export default function AdminDeposits() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/users');
      setUsers(data.users || []);
    } catch (err) {
      toast.error("Failed to synchronize user ledgers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId, transactionId) => {
    if (!window.confirm("CONFIRM: Has the capital successfully cleared on the blockchain?")) return;
    
    setProcessingId(transactionId);
    try {
      await api.post('/api/users/approve-deposit', { userId, transactionId });
      toast.success("Capital Credited Successfully", { icon: '💰' });
      fetchUsers(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Internal Node Error");
    } finally {
      setProcessingId(null);
    }
  };

  // Flatten the pending deposits for easier rendering and empty-state checking
  const pendingDeposits = users.flatMap(user => 
    (user.ledger || [])
      .filter(t => t.status === 'pending' && t.type === 'deposit')
      .map(tx => ({ ...tx, user }))
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate('/admin')}
              className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Inbound Queue</h1>
              <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mt-1">
                Awaiting Manual Confirmation
              </p>
            </div>
          </div>
          <button 
            onClick={fetchUsers}
            className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-yellow-500/10 transition-all"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-yellow-500' : 'text-gray-400'} />
          </button>
        </div>

        {/* Ledger List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-20 text-center bg-[#0a0c10] border border-white/5 rounded-[3rem]">
              <RefreshCw className="animate-spin mx-auto text-yellow-500 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Syncing Node Ledger...</p>
            </div>
          ) : pendingDeposits.length === 0 ? (
            <div className="p-20 text-center bg-[#0a0c10] border border-white/5 rounded-[3rem]">
              <ShieldCheck className="mx-auto text-gray-800 mb-4 opacity-20" size={48} />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">All inbound flows are settled.</p>
            </div>
          ) : (
            pendingDeposits.map((tx) => (
              <div 
                key={tx._id} 
                className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-yellow-500/30 transition-all shadow-2xl"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <Wallet className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black italic uppercase tracking-tighter text-white">
                      {tx.user.fullName}
                    </h4>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                      {tx.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-8 w-full md:w-auto">
                  <div>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Proposed Amount</p>
                    <p className="text-2xl font-black text-emerald-400 italic">€{Number(tx.amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Method / Hash</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded">
                        {tx.currency || 'BTC'}
                      </span>
                      {tx.txHash && (
                        <a 
                          href={`https://mempool.space/tx/${tx.txHash}`} 
                          target="_blank" 
                          className="text-gray-600 hover:text-white"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  disabled={processingId === tx._id}
                  onClick={() => handleApprove(tx.user._id, tx._id)}
                  className="w-full md:w-auto bg-yellow-500 hover:bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-yellow-500/10 disabled:opacity-50"
                >
                  {processingId === tx._id ? (
                    <RefreshCw className="animate-spin mx-auto" size={18} />
                  ) : (
                    "Confirm Payment"
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Audit Disclaimer */}
        <p className="text-center text-[9px] text-gray-800 uppercase font-black tracking-[0.5em] mt-12">
          Operator Session: SHA-256 Secured & Audited
        </p>
      </div>
    </div>
  );
}
