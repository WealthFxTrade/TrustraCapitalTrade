import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

const bip32 = BIP32Factory(ecc);

/**
 * 🛠️ 1. ADDRESS DERIVATION (BIP84 SegWit P2WPKH)
 */
export const deriveBtcAddress = (xpub, index) => {
  try {
    const isMainnet = process.env.BITCOIN_NETWORK === 'mainnet';
    const network = isMainnet ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    
    if (!xpub) throw new Error('BITCOIN_XPUB is missing from environment variables');

    const node = bip32.fromBase58(xpub, network);
    // Standard Receive Path: m/0/index
    const child = node.derive(0).derive(index);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: network,
    });
    return address;
  } catch (error) {
    console.error('❌ [BTC_DERIVATION_ERROR]:', error.message);
    throw error;
  }
};

/**
 * 💰 2. BALANCE CHECKING (via Mempool.space)
 */
export const getBtcBalance = async (address) => {
  try {
    const response = await axios.get(`https://mempool.space{address}`);
    const { funded_txo_sum, spent_txo_sum } = response.data.chain_stats;
    const balanceSats = funded_txo_sum - spent_txo_sum;
    return balanceSats / 1e8;
  } catch (error) {
    console.error(`⚠️ [BALANCE_FETCH_FAILED] ${address}`);
    return 0;
  }
};

/**
 * 🛰️ 3. CONFIRMATION CHECKER (via Mempool.space)
 */
export const getBtcTxConfirmations = async (txid) => {
  try {
    if (!txid) return 0;
    const [txRes, tipRes] = await Promise.all([
      axios.get(`https://mempool.space{txid}`),
      axios.get(`https://mempool.space`)
    ]);

    if (!txRes.data.status.confirmed) return 0;
    
    const currentHeight = tipRes.data;
    const txHeight = txRes.data.status.block_height;
    return currentHeight - txHeight + 1;
  } catch (error) {
    console.warn(`⚠️ [CONFIRM_CHECK_FAILED] TXID: ${txid}`);
    return 0;
  }
};

// 🔗 SYNCED ALIASES
export const deriveAddressFromXpub = deriveBtcAddress;
export const generateBitcoinAddress = deriveBtcAddress;

