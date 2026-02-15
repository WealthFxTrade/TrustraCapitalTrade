import React, { useEffect, useState, useCallback } from 'react';
import api from '../api'; // Use your fixed axios instance with interceptors
import { QRCodeSVG } from 'qrcode.react'; // Standard for 2026 React apps
import { FaSyncAlt, FaCopy, FaCheck } from 'react-icons/fa';

const BtcDeposit = () => {
  const [address, setAddress] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // 1. Fetch Unique BTC Address (Unified with addressService.js)
  const fetchAddress = useCallback(async (fresh = false) => {
    try {
      setLoading(true);
      setError('');

      // Points to the fixed route: app.use('/api/bitcoin', bitcoinRoutes)
      // Pass fresh=true if the user wants a new index from the HD wallet
      const { data } = await api.get(`/bitcoin/deposit${fresh ? '?fresh=true' : ''}`);

      if (data.success) {
        setAddress(data.btcAddress);
      } else {
        throw new Error(data.message || 'Secure Node Handshake Failed');
      }
    } catch (err) {
      console.error('BTC Sync Error:', err);
      setError(err.response?.data?.message || 'Failed to synchronize deposit node');
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Deposit Ledger
  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const { data } = await api.get('/transactions/history?type=deposit&currency=BTC');
      if (data.success) {
        setHistory(data.transactions || []);
      }
    } catch (err) {
      console.error('History Sync Error:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddress();
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [fetchAddress, fetchHistory]);

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#020617] text-white rounded-3xl border border-white/5 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">BTC Deposit Node</h2>
          <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Direct Chain Injection</p>
        </div>
        <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-yellow-500 uppercase">Network Active</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => fetchAddress()} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* --- Main Deposit Card --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 mb-12">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="p-4 bg-white rounded-2xl shadow-xl shadow-white/5">
            {loading ? (
              <div className="w-[180px] h-[180px] flex items-center justify-center text-black font-bold animate-pulse">SYNCING...</div>
            ) : (
              <QRCodeSVG value={address || 'TRUSTRA'} size={180} />
            )}
          </div>
          <button 
            onClick={() => fetchAddress(true)}
            className="flex items-center gap-2 text-[10px] font-bold text-white/40 hover:text-yellow-500 transition-colors uppercase tracking-widest"
          >
            <FaSyncAlt className={loading ? 'animate-spin' : ''} /> Generate New Address
          </button>
        </div>

        <div className="flex flex-col justify-center">
          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Your Unique Deposit Address</label>
          <div className="flex items-center gap-3 p-4 bg-black/40 rounded-xl border border-white/5 mb-6 group">
            <code className="text-sm font-mono text-yellow-500 truncate">{address || 'Initializing Secure Vault...'}</code>
            <button onClick={copyToClipboard} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              {copied ? <FaCheck className="text-green-500" /> : <FaCopy className="text-white/40" />}
            </button>
          </div>

          <div className="space-y-4 text-xs text-white/40 leading-relaxed">
            <p className="flex items-center gap-2 italic">
              <span className="w-1 h-1 bg-yellow-500 rounded-full" />
              Minimum Deposit: 0.0001 BTC
            </p>
            <p className="flex items-center gap-2 italic">
              <span className="w-1 h-1 bg-yellow-500 rounded-full" />
              Confirmation Time: ~10-30 Minutes (3 confirmations)
            </p>
            <p className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-yellow-600 font-medium">
              Important: Send only BTC to this Native SegWit address. Assets sent to incorrect protocols cannot be recovered.
            </p>
          </div>
        </div>
      </div>

      {/* --- History Table --- */}
      <div className="overflow-hidden">
        <h3 className="text-sm font-bold text-white/60 mb-6 uppercase tracking-widest">Recent Node Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-white/20 border-b border-white/5 uppercase tracking-tighter">
                <th className="pb-4 font-bold">Transaction ID</th>
                <th className="pb-4 font-bold">Volume</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="text-white/60">
              {historyLoading && history.length === 0 ? (
                <tr><td colSpan="4" className="py-8 text-center animate-pulse tracking-widest font-bold">SCANNING BLOCKCHAIN...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="4" className="py-8 text-center text-white/20 italic">No incoming data detected on this node.</td></tr>
              ) : (
                history.map((tx) => (
                  <tr key={tx._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 font-mono text-yellow-500/80">{tx.description?.split(': ')[1]?.slice(0, 12) || tx._id.slice(0, 12)}...</td>
                    <td className="py-4 font-bold">{tx.amount} BTC</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${tx.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 text-white/30">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BtcDeposit;

