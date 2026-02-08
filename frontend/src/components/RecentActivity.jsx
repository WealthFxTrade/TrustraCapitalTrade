// src/components/RecentActivity.jsx
import React from 'react';

// Inline icons for transaction types
const typeIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'deposit': return '⬆️';
    case 'withdrawal': return '⬇️';
    case 'trade': return '🔄';
    default: return '💰';
  }
};

// Format ISO timestamp to readable string
const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Color-coded status
const statusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'completed': return '#2ecc71';
    case 'pending': return '#f39c12';
    case 'failed': return '#e74c3c';
    default: return '#666';
  }
};

// Format EUR
const formatEUR = (value) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);

export default function RecentActivity({ transactions, loading }) {
  return (
    <div style={{
      marginTop: '30px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px'
    }}>
      <h3 style={{ marginBottom: '15px' }}>Recent Activity</h3>

      {loading ? (
        <p style={{ color: '#999' }}>Loading recent transactions...</p>
      ) : transactions.length === 0 ? (
        <p style={{ color: '#666' }}>No record found</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Type</th>
              <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ccc' }}>Value</th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{typeIcon(tx.type)}</span>
                  <span>{tx.type}</span>
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  {tx.asset === 'EUR' ? formatEUR(tx.amount) : tx.amount}
                </td>
                <td style={{ padding: '8px', color: statusColor(tx.status), fontWeight: '600' }}>
                  {tx.status}
                </td>
                <td style={{ padding: '8px', color: '#666', fontSize: '0.85rem' }}>
                  {formatDate(tx.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
