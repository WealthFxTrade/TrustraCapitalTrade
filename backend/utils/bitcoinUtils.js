import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BTC_RPC_URL = process.env.BTC_RPC_URL;

/**
 * Get BTC transaction confirmations from RPC node
 */
export async function getBtcTxConfirmations(txHash) {
  try {
    const payload = {
      jsonrpc: '1.0',
      id: 'curltext',
      method: 'gettransaction',
      params: [txHash],
    };

    const response = await axios.post(BTC_RPC_URL, payload, {
      auth: {
        username: process.env.BTC_RPC_USER || '',
        password: process.env.BTC_RPC_PASS || '',
      },
    });

    if (response.data.error) return null;
    return response.data.result.confirmations || 0;
  } catch (err) {
    return null;
  }
}

/**
 * Generate a deterministic BTC deposit address for a user using XPUB
 */
export async function generateBtcAddressFromXpub(userId) {
  // Simplified example: derive address deterministically from XPUB + userId
  // Production: integrate proper HD wallet derivation
  return `bc1q${userId.slice(-30)}...`; // deterministic pseudo-address
}
