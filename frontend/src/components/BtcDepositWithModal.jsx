// src/components/BtcDepositWithModal.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { FaSyncAlt, FaCopy, FaCheck } from 'react-icons/fa';
import Modal from 'react-modal';
import { io } from 'socket.io-client';

Modal.setAppElement('#root');

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:10000';

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

      const url = `/api/deposits/btc${fresh ? '?fresh=true' : ''}`;
      const { data } = await axios.get(url, { withCredentials: true });

      if (!data.success) {
        throw new Error(data.message || 'Invalid response format');
      }

      setDeposit(data.data);
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
      setError('');

      const { data } = await axios.get('/api/deposits/btc/history', {
        withCredentials: true,
      });

      if (!data.success) {
        throw new Error(data.message || 'Invalid response');
      }

      const newHistory = data.data || [];

      // Detect newly confirmed deposits
      const newlyConfirmed = newHistory.filter(
        (dep) =>
          dep.status === 'confirmed' &&
          !history.some((h) => h._id === dep._id && h.status === 'confirmed')
      );

      if (newlyConfirmed.length > 0) {
        // Show the most recent confirmed one in modal
        setModalDeposit(newlyConfirmed[0]);
      }

      setHistory(newHistory);
    } catch (err) {
      console.error('History fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load deposit history');
    } finally {
      setHistoryLoading(false);
    }
  }, [history]);

  // Copy address to clipboard
  const copyAddress = () => {
    if (!deposit?.address) return;

    navigator.clipboard.writeText(deposit.address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ──────────────────────────────────────────────
  // Socket.IO Connection
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`Socket connected: ${socket.id}`);
      socket.emit('join', userId);
    });

    socket.on('deposit:update', (updatedDeposit) => {
      console.log('Real-time deposit update received:', updatedDeposit);

      // Update current deposit if matching
      if (deposit && deposit._id === updatedDeposit._id) {
        setDeposit(updatedDeposit);
      }

      // Update history list
      setHistory((prev) => {
        const exists = prev.find((d) => d._id === updatedDeposit._id);
        if (exists) {
          return prev.map((d) =>
            d._id === updatedDeposit._id ? updatedDeposit : d
          );
        }
        return [updatedDeposit, ...prev];
      });

      // Show modal for newly confirmed deposits
      if (updatedDeposit.status === 'confirmed') {
        setModalDeposit(updatedDeposit);
      }
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
    });

    // Initial data load
    fetchDeposit();
    fetchHistory();

    // Poll history as fallback (every 30s)
    const interval = setInterval(fetchHistory, 30000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [userId, deposit, fetchDeposit, fetchHistory]);

  return (
    <div className="btc-deposit-container">
      <h2 className="section-title">BTC Deposit</h2>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button
            onClick={() => {
              setError('');
              fetchDeposit();
              fetchHistory();
            }}
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      )}

      {/* Deposit Address Card */}
      <div className="deposit-card">
        <h3>Your BTC Deposit Address</h3>

        {loading ? (
          <div className="loading">Loading address...</div>
        ) : deposit ? (
          <div className="address-content">
            <div className="qr-and-address">
              <div className="qr-wrapper">
                <QRCode
                  value={deposit.address}
                  size={180}
                  level="H"
                  fgColor="#000"
                  bgColor="#ffffff"
                />
              </div>

              <div className="address-block">
                <div className="address-text">
                  <code>{deposit.address}</code>
                  <button
                    onClick={copyAddress}
                    className="copy-btn"
                    title={copied ? 'Copied!' : 'Copy address'}
                    aria-label="Copy deposit address"
                  >
                    {copied ? <FaCheck color="#4caf50" /> : <FaCopy />}
                  </button>
                </div>

                <p className={`status status-${deposit.status}`}>
                  Status: {deposit.status.toUpperCase()}
                </p>

                <p className="created">
                  Created: {new Date(deposit.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchDeposit(true)}
              className="refresh-btn"
              disabled={loading}
            >
              <FaSyncAlt /> Generate New Address
            </button>

            <p className="info-text">
              Send only <strong>BTC</strong> to this address. Minimum confirmations: 3.
              <br />
              Do not reuse after confirmation.
            </p>
          </div>
        ) : (
          <p className="no-data">No deposit address available</p>
        )}
      </div>

      {/* Deposit History */}
      <div className="history-section">
        <h3>Recent Deposit History</h3>

        {historyLoading ? (
          <div className="loading">Loading history...</div>
        ) : history.length === 0 ? (
          <p className="no-data">No deposits yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Address</th>
                  <th>Amount (BTC)</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>Confirms</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 10).map((dep) => (
                  <tr key={dep._id}>
                    <td title={dep._id}>{dep._id.slice(0, 8)}...</td>
                    <td title={dep.address}>
                      {dep.address.slice(0, 8)}...{dep.address.slice(-6)}
                    </td>
                    <td>{Number(dep.amount || 0).toFixed(8)}</td>
                    <td>{Number(dep.receivedAmount || 0).toFixed(8)}</td>
                    <td className={`status status-${dep.status}`}>
                      {dep.status.toUpperCase()}
                    </td>
                    <td>{dep.confirmations || 0}</td>
                    <td>{new Date(dep.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!modalDeposit}
        onRequestClose={() => setModalDeposit(null)}
        contentLabel="Deposit Confirmed"
        className="confirmation-modal"
        overlayClassName="modal-overlay"
      >
        {modalDeposit && (
          <div className="modal-content">
            <h2>Deposit Confirmed!</h2>
            <p>
              Your deposit of{' '}
              <strong>{Number(modalDeposit.amount || 0).toFixed(8)} BTC</strong> has been confirmed.
            </p>
            <p className="modal-id">
              Deposit ID: <code>{modalDeposit._id}</code>
            </p>
            <p className="modal-time">
              Confirmed at:{' '}
              {new Date(modalDeposit.updatedAt || modalDeposit.createdAt).toLocaleString()}
            </p>
            <button
              onClick={() => setModalDeposit(null)}
              className="close-modal-btn"
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Styles */}
      <style jsx>{`
        .btc-deposit-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 16px;
        }

        .section-title {
          font-size: 1.8rem;
          margin-bottom: 24px;
          color: #1a1a1a;
        }

        .deposit-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          padding: 24px;
          margin-bottom: 32px;
        }

        .address-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .qr-and-address {
          display: flex;
          flex-wrap: wrap;
          gap: 32px;
          justify-content: center;
          margin-bottom: 24px;
        }

        .qr-wrapper {
          background: white;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .address-block {
          flex: 1;
          min-width: 280px;
        }

        .address-text {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          background: #f5f5f5;
          padding: 12px;
          border-radius: 8px;
          font-family: monospace;
          word-break: break-all;
        }

        .copy-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 4px;
        }

        .status {
          font-weight: 600;
        }

        .status-pending { color: #f59e0b; }
        .status-confirmed { color: #4caf50; }
        .status-error,
        .status-rejected { color: #ef4444; }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin: 16px 0;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .info-text {
          margin-top: 16px;
          color: #666;
          font-size: 0.9rem;
          text-align: center;
        }

        .history-section h3 {
          margin: 32px 0 16px;
        }

        .table-wrapper {
          overflow-x: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }

        .history-table th,
        .history-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        .history-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #444;
        }

        .error-message {
          background: #fee2e2;
          color: #b91c1c;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .retry-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }

        .loading,
        .no-data {
          color: #666;
          text-align: center;
          padding: 40px 0;
          font-size: 1.1rem;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .confirmation-modal {
          background: white;
          border-radius: 12px;
          padding: 32px;
          max-width: 420px;
          width: 90%;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .modal-content h2 {
          margin: 0 0 16px;
          color: #1a1a1a;
        }

        .modal-id,
        .modal-time {
          margin: 12px 0;
          color: #555;
        }

        .close-modal-btn {
          margin-top: 24px;
          padding: 12px 32px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
        }

        .close-modal-btn:hover {
          background: #2563eb;
        }

        @media (max-width: 768px) {
          .qr-and-address {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default BtcDepositWithModal;
