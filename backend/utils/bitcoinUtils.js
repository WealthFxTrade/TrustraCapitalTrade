import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

const bip32 = BIP32Factory(ecc);

/**
 * 🛠️ 1. ADDRESS DERIVATION (SegWit P2WPKH)
 */
export const deriveBtcAddress = (xpub, index) => {
  try {
    const isMainnet = process.env.BITCOIN_NETWORK === 'mainnet';
    const network = isMainnet ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    if (!xpub) throw new Error('BITCOIN_XPUB is missing from .env');

    const node = bip32.fromBase58(xpub, network);
    const child = node.derive(0).derive(index);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: network,
    });
    return address;
  } catch (error) {
    console.error('[BTC Derivation Error]:', error.message);
    throw error;
  }
};

/**
 * 💰 2. BALANCE CHECKING (Blockchain.info API)
 */
export const getBtcBalance = async (address) => {
  try {
    const response = await axios.get(`https://blockchain.info{address}`);
    const totalReceivedSats = parseInt(response.data);
    return isNaN(totalReceivedSats) ? 0 : totalReceivedSats / 100000000;
  } catch (error) {
    return 0;
  }
};

/**
 * 🛰️ 3. CONFIRMATION CHECKER (Fixes SyntaxError in confirmDeposit.js)
 */
export const getBtcTxConfirmations = async (txid) => {
  try {
    if (!txid) return 0;
    const res = await axios.get(`https://api.blockcypher.com{txid}`);
    return res.data.confirmations || 0;
  } catch (error) {
    console.warn(`[BTC Confirm Check Failed] TXID: ${txid}`);
    return 0;
  }
};

// 🔗 ALIASES
export const deriveAddressFromXpub = deriveBtcAddress;
export const generateBitcoinAddress = deriveBtcAddress;

