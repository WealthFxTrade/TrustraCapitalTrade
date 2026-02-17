import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '../api/api'; // ✅ Use your unified API instance
import { QRCodeSVG } from 'qrcode.react'; // ✅ Updated for modern qrcode.react
import { FaSyncAlt, FaCopy, FaCheck } from 'react-icons/fa';
import Modal from 'react-modal';
import { io } from 'socket.io-client';

Modal.setAppElement('#root');

// ✅ VITE FIX: Changed process.env to import.meta.env
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://trustracapitaltrade-backend.onrender.com';

const BtcDepositWithModal = ({ userId }) => {
  const [deposit, setDeposit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [modalDeposit, setModalDeposit] = useState(null);
  const socketRef = useRef(null);

  // Fetch current deposit address
  const fetchDeposit = useCallback(async (fresh = false) => {
    try {
      setLoading(true);
      setError('');
      // ✅ Path adjusted to match your backend routes
      const url = `/deposits/btc${fresh ? '?fresh=true' : ''}`;
      const res = await api.get(url); 
      
      if (res.data.success) {
        setDeposit(res.data.data);
      }
    } catch (err) {
      console.error('Deposit fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load deposit address');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch deposit history
  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get('/deposits/btc/history');
      
      const newHistory = res.data.data || [];
      
      // Detect newly confirmed deposits for the Modal
      const newlyConfirmed = newHistory.filter(
        (dep) => dep.status === 'confirmed' && 
        !history.some((h) => h._id === dep._id && h.status === 'confirmed')
      );

      if (newlyConfirmed.length > 0) {
        setModalDeposit(newlyConfirmed[0]);
      }
      setHistory(newHistory);
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [history]);

  const copyAddress = () => {
    if (!deposit?.address) return;
    navigator.clipboard.writeText(deposit.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!userId) return;

    // ✅ Socket.IO setup using Vite-safe URL
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', userId);
    });

    socket.on('deposit:update', (updatedDeposit) => {
      if (deposit && deposit._id === updatedDeposit._id) {
        setDeposit(updatedDeposit);
      }
      fetchHistory(); // Refresh history on update
      if (updatedDeposit.status === 'confirmed') {
        setModalDeposit(updatedDeposit);
      }
    });

    fetchDeposit();
    fetchHistory();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [userId, fetchDeposit, fetchHistory]);

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-xs uppercase tracking-widest">BTC Node Deposit</h3>
        <button onClick={() => fetchDeposit(true)} className="text-blue-500 hover:rotate-180 transition-transform duration-500">
          <FaSyncAlt size={14} />
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center animate-pulse text-slate-500 text-[10px] font-black uppercase">Syncing Node...</div>
      ) : deposit ? (
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-2xl">
            <QRCodeSVG value={deposit.address} size={180} />
          </div>
          
          <div className="w-full space-y-2">
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Protocol Address</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-black/40 border border-slate-800 p-3 rounded-xl text-[10px] text-blue-400 break-all font-mono">
                {deposit.address}
              </code>
              <button onClick={copyAddress} className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-white hover:bg-slate-700 transition-colors">
                {copied ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-red-400 text-xs font-bold">{error}</p>
      )}

      {/* Success Modal */}
      <Modal
        isOpen={!!modalDeposit}
        onRequestClose={() => setModalDeposit(null)}
        className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] max-w-md mx-auto mt-20 outline-none shadow-2xl"
        overlayClassName="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000]"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <FaCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-white italic uppercase">Deposit Confirmed</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            {modalDeposit?.amount} BTC added to vault
          </p>
          <button onClick={() => setModalDeposit(null)} className="btn-primary w-full py-4 uppercase text-[10px]">
            Return to Dashboard
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BtcDepositWithModal;

