import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, CheckCircle, XCircle, 
  ExternalLink, Search, Loader2, 
  ShieldAlert, Banknote, User,
  Filter, AlertTriangle
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function WithdrawalManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/admin/withdrawals-pending');
      setRequests(data);
    } catch (err) {
      toast.error("Failed to sync Outbound Queue");
    } finally {
      setLoading(false);
    }
  };

  const processWithdrawal = async (id, status) => {
    const loadToast = toast.loading(`${status === 'completed' ? 'Authorizing' : 'Cancelling'} Capital Extraction...`);
    try {
      await api.post(`/admin/withdrawals/${id}`, { status });
      toast.success("Transaction Finalized on Ledger", { id: loadToast });
      setSelectedTx(null);
      fetchRequests();
    } catch (err) {
      toast.error("Settlement Failed", { id: loadToast });
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 font-sans">
      <header className="mb-12">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">
          Outbound <span className="text-rose-500">Settlement</span> Terminal
        </h1>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
          Final Authorization Node for Institutional Extractions
        </p>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-rose-500" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── QUEUE LIST ── */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-6 px-4">Pending Authorization</h3>
            {requests.map((tx) => (
              <div 
                key={tx._id}
                onClick={() => setSelectedTx(tx)}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer ${
                  selectedTx?._id === tx._id ? 'bg-rose-500/10 border-rose-500' : 'bg-[#0a0c10] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black italic">€{tx.amount.toLocaleString()}</span>
                  <div className="text-[8px] font-black uppercase px-3 py-1 bg-white/5 rounded-full text-gray-400">
                    {tx.user?.fullName?.split(' ')[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── ACTION TERMINAL ── */}
          <div className="lg:col-span-8">
            {selectedTx ? (
              <div className="bg-[#0a0c10] border border-white/10 rounded-[3rem] p-10 md:p-14 space-y-10 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">€{selectedTx.amount.toLocaleString()}</h2>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Requested for Extraction</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => processWithdrawal(selectedTx._id, 'rejected')}
                      className="px-8 py-4 bg-white/5 hover:bg-rose-600 rounded-2xl text-[10px] font-black uppercase transition-all"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => processWithdrawal(selectedTx._id, 'completed')}
                      className="px-8 py-4 bg-rose-600 hover:bg-white hover:text-black rounded-2xl text-[10px] font-black uppercase transition-all"
                    >
                      Authorize Payout
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/5">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-gray-600">Beneficiary</p>
                    <p className="text-sm font-bold">{selectedTx.user?.fullName}</p>
                    <p className="text-[10px] font-mono text-gray-500">{selectedTx.user?.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-gray-600">Destination Address</p>
                    <code className="text-xs text-yellow-500 font-mono break-all">{selectedTx.address}</code>
                  </div>
                </div>

                <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-2xl flex items-center gap-4">
                  <AlertTriangle className="text-rose-500" size={20} />
                  <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
                    Verify the destination address on the external block explorer before authorization. Once the payout is signed, it cannot be reversed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 border border-dashed border-white/5 rounded-[4rem] p-20">
                <Banknote size={64} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.4em]">Select a transaction for settlement</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
