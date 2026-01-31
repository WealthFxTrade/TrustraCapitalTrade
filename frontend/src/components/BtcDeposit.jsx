// src/components/BtcDeposit.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { FaSyncAlt, FaCopy, FaCheck } from 'react-icons/fa';

const BtcDeposit = () => {
  const [deposit, setDeposit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Memoized fetch functions
  const fetchDeposit = useCallback(async (fresh = false) => {
    try {
      setLoading(true);
      setError('');

      const url = `/api/deposits/btc${fresh ? '?fresh=true' : ''}`;
      const { data } = await axios.get(url, { withCredentials: true });

      if (data.success) {
        setDeposit(data.data);
      } else {
        throw new Error(data.message || 'Invalid response');
      }
    } catch (err) {
      console.error('Deposit fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load deposit address');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setError('');

      const { data } = await axios.get('/api/deposits/btc/history', {
        withCredentials: true,
      });

      if (data.success) {
        setHistory(data.data || []);
      } else {
        throw new Error(data.message || 'Invalid response');
      }
    } catch (err) {
      console.error('History fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load deposit history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Initial load + auto-refresh history every 60s
  useEffect(() => {
    fetchDeposit();
    fetchHistory();

    const interval = setInterval(fetchHistory, 60000);
    return () => clearInterval(interval);
  }, [fetchDeposit, fetchHistory]);

  // Copy address to clipboard
  const copyAddress = () => {
    if (deposit?.address) {
      navigator.clipboard.writeText(deposit.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="btc-deposit-container">
      <h2 className="section-title">BTC Deposit</h2>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => { setError(''); fetchDeposit(); }} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Deposit Address Card */}
      <div className="deposit-card">
        <h3>Deposit Address</h3>

        {loading ? (
          <div className="loading">Loading address...</div>
        ) : deposit ? (
          <div className="address-content">
            <div className="qr-and-address">
              <div className="qr-wrapper">
                <QRCode
                  value={deposit.address}
                  size={180}
                  level="H" // high error correction
                  fgColor="#000"
                  bgColor="#fff"
                />
              </div>

              <div className="address-block">
                <div className="address-text">
                  <code>{deposit.address}</code>
                  <button
                    onClick={copyAddress}
                    className="copy-btn"
                    title="Copy address"
                    aria-label="Copy deposit address"
                  >
                    {copied ? <FaCheck color="#4caf50" /> : <FaCopy />}
                  </button>
                </div>

                {copied && <span className="copied-tooltip">Copied!</span>}

                <p className="status">
                  Status: <strong className={deposit.status === 'confirmed' ? 'confirmed' : 'pending'}>
                    {deposit.status.toUpperCase()}
                  </strong>
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

            <p className="info">
              Send only <strong>BTC</strong> to this address. Minimum confirmations required: 3.
            </p>
          </div>
        ) : (
          <p className="no-data">No deposit address available</p>
        )}
      </div>

      {/* Deposit History */}
      <div className="history-section">
        <h3>Deposit History</h3>

        {historyLoading ? (
          <div className="loading">Loading history...</div>
        ) : history.length === 0 ? (
          <p className="no-data">No deposit history yet.</p>
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
                  <th>Confirmations</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((dep) => (
                  <tr key={dep._id}>
                    <td title={dep._id}>{dep._id.slice(0, 8)}...</td>
                    <td title={dep.address}>
                      {dep.address.slice(0, 8)}...{dep.address.slice(-6)}
                    </td>
                    <td>{Number(dep.amount || 0).toFixed(8)}</td>
                    <td>{Number(dep.receivedAmount || 0).toFixed(8)}</td>
                    <td className={`status ${dep.status}`}>
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

      {/* Scoped styles */}
      <style jsx>{`
        .btc-deposit-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 16px;
        }

        .section-title {
          font-size: 1.8rem;
          margin-bottom: 24px;
          color: #333;
        }

        .deposit-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          padding: 24px;
          margin-bottom: 32px;
        }

        .deposit-card h3 {
          margin-top: 0;
          color: #1a1a1a;
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

        .copied-tooltip {
          font-size: 0.8rem;
          color: #4caf50;
          margin-left: 8px;
        }

        .status {
          font-weight: 600;
        }

        .status.confirmed {
          color: #4caf50;
        }

        .status.pending {
          color: #f59e0b;
        }

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
          transition: background 0.2s;
        }

        .refresh-btn:hover {
          background: #2563eb;
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .info {
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

        .status.pending { color: #f59e0b; font-weight: bold; }
        .status.confirmed { color: #4caf50; font-weight: bold; }
        .status.error,
        .status.rejected { color: #ef4444; font-weight: bold; }

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

        .no-data,
        .loading {
          color: #666;
          text-align: center;
          padding: 40px 0;
          font-size: 1.1rem;
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

export default BtcDeposit;
