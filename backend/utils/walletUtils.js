// backend/utils/walletUtils.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BTC_RPC_URL = process.env.BTC_RPC_URL;       // Bitcoin Core RPC URL
const BTC_RPC_USER = process.env.BTC_RPC_USER;
const BTC_RPC_PASS = process.env.BTC_RPC_PASS;

export async function generateBtcAddress(userId) {
  const payload = {
    jsonrpc: '1.0',
    id: 'curltext',
    method: 'getnewaddress',
    params: [userId], // optional label
  };

  const response = await axios.post(BTC_RPC_URL, payload, {
    auth: { username: BTC_RPC_USER, password: BTC_RPC_PASS },
  });

  if (response.data.error) {
    throw new Error(`BTC RPC Error: ${response.data.error.message}`);
  }

  return response.data.result; // returns real BTC address
}
