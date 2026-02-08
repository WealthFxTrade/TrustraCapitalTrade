// src/components/DepositTab.jsx
import { useState, useEffect } from 'react';
import { getDepositAddress } from '../api/wallet.js';
import QRCode from 'qrcode.react';

export default function DepositTab() {
  const assets = ['BTC', 'ETH', 'USDT']; // Supported assets
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch deposit address from backend
  const fetchAddress = async (fresh = false, retryCount = 2) => {
    setLoading(true);
    setError('');

    try {
      const addr = await getDepositAddress(selectedAsset, fresh);
      if (!addr) throw new Error('No address returned from API');
      setAddress(addr);
    } catch (err) {
      console.error(`${selectedAsset} Address fetch error:`, err);
      if (retryCount > 0) {
        setTimeout(() => fetchAddress(fresh, retryCount - 1), 1000);
      } else {
        setError(err.message || `Failed to generate ${selectedAsset} address`);
        setAddress('');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, [selectedAsset]);

  return (
    <div>
      <h3>{selectedAsset} Deposit</h3>

      {/* Asset Selector */}
      <div style={{ marginBottom: '15px' }}>
        {assets.map((asset) => (
          <button
            key={asset}
            onClick={() => setSelectedAsset(asset)}
            disabled={loading}
            style={{
              padding: '6px 12px',
              marginRight: '8px',
              borderRadius: '6px',
              backgroundColor: selectedAsset === asset ? '#4CAF50' : '#f0f0f0',
              color: selectedAsset === asset ? '#fff' : '#333',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {asset}
          </button>
        ))}
      </div>

      {/* Address Display & QR */}
      {loading ? (
        <p style={{ color: '#999' }}>Fetching {selectedAsset} address...</p>
      ) : error ? (
        <p style={{ color: '#e74c3c' }}>{error}</p>
      ) : (
        <>
          <code style={{ wordBreak: 'break-all', display: 'block', marginBottom: '15px' }}>
            {address}
          </code>

          {/* QR Code */}
          <div style={{ margin: '15px 0' }}>
            <QRCode value={address} size={180} level="H" />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={() => fetchAddress(true)}
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: '#2196F3',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Generate New Address
            </button>

            <button
              onClick={() => navigator.clipboard.writeText(address)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: '#555',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Copy
            </button>
          </div>

          <p style={{ marginTop: '15px', fontSize: '0.85rem', color: '#666' }}>
            Send only {selectedAsset} to this address. Sending any other coin will result in permanent loss.<br />
            System: Automatic confirmation (3 blocks)
          </p>
        </>
      )}
    </div>
  );
}
