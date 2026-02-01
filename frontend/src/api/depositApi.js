const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

export async function getBtcDepositAddress(token, fresh = false) {
  const res = await fetch(`${BACKEND_URL}/api/deposits/btc${fresh ? '?fresh=true' : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch BTC address: ${res.status}`);
  return res.json();
}
