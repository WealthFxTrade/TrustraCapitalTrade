import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

const bip32 = BIP32Factory(ecc);

// ─── Mempool.space base URL ────────────────────────────────────
const getMempoolBase = () => {
  const isMainnet = detectNetwork(process.env.BITCOIN_XPUB) === bitcoin.networks.bitcoin;
  return isMainnet
    ? 'https://mempool.space/api'
    : 'https://mempool.space/testnet/api';
};

// ─── Auto-detect network from key prefix ───────────────────────
const detectNetwork = (xpub) => {
  if (!xpub) throw new Error('BITCOIN_XPUB is missing from environment variables');

  // Mainnet prefixes: xpub (BIP44), ypub (BIP49), zpub (BIP84)
  if (xpub.startsWith('xpub') || xpub.startsWith('ypub') || xpub.startsWith('zpub')) {
    return bitcoin.networks.bitcoin;
  }

  // Testnet prefixes: tpub (BIP44), upub (BIP49), vpub (BIP84)
  if (xpub.startsWith('tpub') || xpub.startsWith('upub') || xpub.startsWith('vpub')) {
    return bitcoin.networks.testnet;
  }

  throw new Error(`Unrecognized xpub prefix: ${xpub.substring(0, 4)}`);
};

/**
 * 🛠️ 1. ADDRESS DERIVATION (BIP84 SegWit P2WPKH)
 *    Derives a receive address at path: m/0/{index}
 */
export const deriveBtcAddress = (xpub, index) => {
  try {
    if (!xpub) {
      throw new Error('BITCOIN_XPUB is missing from environment variables');
    }

    if (index === undefined || index === null || !Number.isInteger(index) || index < 0) {
      throw new Error(`Invalid derivation index: ${index}`);
    }

    const network = detectNetwork(xpub);
    const node = bip32.fromBase58(xpub, network);

    // Standard Receive Path: m/0/index
    const child = node.derive(0).derive(index);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network,
    });

    if (!address) {
      throw new Error(`Failed to derive address at index ${index}`);
    }

    console.log(`✅ [BTC_DERIVED] Index ${index} → ${address}`);
    return address;
  } catch (error) {
    console.error('❌ [BTC_DERIVATION_ERROR]:', error.message);
    throw error;
  }
};

/**
 * 💰 2. BALANCE CHECKING (via Mempool.space)
 *    Returns balance in BTC (not satoshis)
 */
export const getBtcBalance = async (address) => {
  try {
    if (!address) {
      console.warn('⚠️ [BALANCE_CHECK] No address provided');
      return 0;
    }

    const base = getMempoolBase();
    const response = await axios.get(`${base}/address/${address}`, {
      timeout: 10000,
    });

    const { funded_txo_sum, spent_txo_sum } = response.data.chain_stats;
    const balanceSats = funded_txo_sum - spent_txo_sum;
    const balanceBtc = balanceSats / 1e8;

    console.log(`💰 [BALANCE] ${address}: ${balanceBtc} BTC`);
    return balanceBtc;
  } catch (error) {
    console.error(`⚠️ [BALANCE_FETCH_FAILED] ${address}:`, error.message);
    return 0;
  }
};

/**
 * 🛰️ 3. CONFIRMATION CHECKER (via Mempool.space)
 *    Returns number of confirmations for a given txid
 */
export const getBtcTxConfirmations = async (txid) => {
  try {
    if (!txid) {
      console.warn('⚠️ [CONFIRM_CHECK] No txid provided');
      return 0;
    }

    const base = getMempoolBase();
    const [txRes, tipRes] = await Promise.all([
      axios.get(`${base}/tx/${txid}`, { timeout: 10000 }),
      axios.get(`${base}/blocks/tip/height`, { timeout: 10000 }),
    ]);

    if (!txRes.data.status.confirmed) return 0;

    const currentHeight = tipRes.data;
    const txHeight = txRes.data.status.block_height;
    const confirmations = currentHeight - txHeight + 1;

    console.log(`🛰️ [CONFIRMATIONS] ${txid}: ${confirmations}`);
    return confirmations;
  } catch (error) {
    console.warn(`⚠️ [CONFIRM_CHECK_FAILED] TXID: ${txid}:`, error.message);
    return 0;
  }
};

// 🔗 SYNCED ALIASES
export const deriveAddressFromXpub = deriveBtcAddress;
export const generateBitcoinAddress = deriveBtcAddress;
