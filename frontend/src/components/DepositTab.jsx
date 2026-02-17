// src/components/DepositTab.jsx
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/api';  // ← the only API import needed now

export default function DepositTab() {
  const assets = ['BTC', 'ETH', 'USDT'];
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch deposit address from backend (replaces getDepositAddress)
  const fetchAddress = async (fresh = false, retryCount = 2) => {
    setLoading(true);
    setError('');

    try {
      // Use direct api call – adjust endpoint if your backend uses different path
      const res = await api.get(`/wallet/address/${selectedAsset}`, {
        params: { fresh }  // if backend supports ?fresh=true param
      });

      const addr = res.data.address || res.data;  // adjust based on your response shape
      if (!addr) throw new Error('No address returned from API');

      setAddress(addr);
    } catch (err) {
      console.error(`${selectedAsset} Address fetch error:`, err);

      if (retryCount > 0) {
        setTimeout(() => fetchAddress(fresh, retryCount - 1), 1000);
      } else {
        setError(err.response?.data?.message || err.message || `Failed to generate ${selectedAsset} address`);
        setAddress('');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();

    // Cleanup
    return () => {
      setLoading(false);
    };
  }, [selectedAsset]);

  return (
    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
      <h3 style={{ marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {selectedAsset} Deposit Node
      </h3>

      {/* Asset Selector */}
      <div style={{ marginBottom: '25px' }}>
        {assets.map((asset) => (
          <button
            key={asset}
            onClick={() => setSelectedAsset(asset)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              marginRight: '10px',
              borderRadius: '8px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              backgroundColor: selectedAsset === asset ? '#4CAF50' : '#2a2d3e',
              color: selectedAsset === asset ? '#fff' : '#888',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {asset}
          </button>
        ))}
      </div>

      {/* Address Display & QR */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p style={{ color: '#999', fontSize: '0.9rem' }} className="animate-pulse">
            Establishing Secure {selectedAsset} Gateway...
          </p>
        </div>
      ) : error ? (
        <div style={{ padding: '20px', border: '1px solid #e74c3c', borderRadius: '10px' }}>
          <p style={{ color: '#e74c3c' }}>{error}</p>
          <button
            onClick={() => fetchAddress()}
            style={{ color: '#fff', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Retry Sync
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-300">
          <label style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', fontWeight: '900' }}>
            Unique Deposit Address
          </label>
          <code
            style={{
              wordBreak: 'break-all',
              display: 'block',
              padding: '12px',
              background: '#000',
              color: '#00ff00',
              borderRadius: '6px',
              fontSize: '0.85rem',
              marginBottom: '15px',
            }}
          >
            {address}
          </code>

          {/* QR Code Section */}
          <div
            style={{
              margin: '20px 0',
              padding: '15px',
              background: '#fff',
              display: 'inline-block',
              borderRadius: '12px',
            }}
          >
            <QRCodeSVG value={address} size={180} level="H" />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={() => fetchAddress(true)}
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#2196F3',
                color: '#fff',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Refresh Address
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(address);
                alert('Address copied to clipboard');
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#333',
                color: '#fff',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Copy
            </button>
          </div>

          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(231, 76, 60, 0.1)', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.75rem', color: '#e74c3c', margin: 0 }}>
              <strong>⚠️ ATTENTION:</strong> Send only <strong>{selectedAsset}</strong> to this address.
              Cross-chain deposits will result in permanent loss.
            </p>
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>
              Network Confirmation: 3 Blocks required.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
