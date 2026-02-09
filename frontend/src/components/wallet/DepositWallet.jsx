import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { generateDepositAddress } from '../../api/wallet.api';
import { useAuthToken } from '../../hooks/useAuthToken';

const ASSETS = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'USDT_ERC20', label: 'USDT (ERC-20)' },
];

const DepositWallet = () => {
  const token = useAuthToken();

  const [asset, setAsset] = useState('BTC');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newAddress = await generateDepositAddress(asset, token);
      setAddress(newAddress);
    } catch (err) {
      setError(err.message || 'Failed to generate address');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = address;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl text-white max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Deposit Crypto</h2>

      <select
        value={asset}
        disabled={loading}
        onChange={(e) => {
          setAsset(e.target.value);
          setAddress('');
        }}
        className="w-full bg-gray-800 p-3 rounded mb-4 border border-gray-700"
      >
        {ASSETS.map((a) => (
          <option key={a.value} value={a.value}>
            {a.label}
          </option>
        ))}
      </select>

      {!address && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold"
        >
          {loading ? 'Generating…' : `Generate ${asset} Address`}
        </button>
      )}

      {error && (
        <p className="text-red-400 text-sm mt-3">{error}</p>
      )}

      {address && (
        <div className="flex flex-col items-center mt-4">
          <div className="bg-white p-2 rounded-lg mb-4">
            <QRCodeCanvas value={address} size={180} />
          </div>

          <div className="w-full bg-gray-800 p-3 rounded flex items-center justify-between border border-gray-700">
            <span className="text-xs truncate mr-2">{address}</span>
            <button
              onClick={copyToClipboard}
              className="text-blue-400 text-sm"
            >
              Copy
            </button>
          </div>

          <p className="text-gray-400 text-xs mt-3 text-center">
            Only send {asset}. Sending any other asset will result in permanent loss.
          </p>
        </div>
      )}
    </div>
  );
};

export default DepositWallet;
