import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

const bip32 = BIP32Factory(ecc);

/**
 * 🛠️ 1. ADDRESS DERIVATION
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
    console.error('BTC Derivation Error:', error.message);
    throw error;
  }
};

/**
 * 💰 2. BALANCE CHECKING (Used by depositScanner.js)
 */
export const getBtcBalance = async (address) => {
  try {
    // Fetching total received (Satoshis) from Blockchain.com API
    const response = await axios.get(`https://blockchain.info{address}`);
    const balanceSats = parseInt(response.data);
    return balanceSats / 100000000; // Convert to BTC
  } catch (error) {
    console.error(`Error fetching balance for ${address}:`, error.message);
    return 0;
  }
};

// 🔗 ALIASES for compatibility across all your services
export const deriveAddressFromXpub = deriveBtcAddress;
export const generateBitcoinAddress = deriveBtcAddress;
