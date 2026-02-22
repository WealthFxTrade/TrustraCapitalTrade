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

    // Load the xPub node
    const node = bip32.fromBase58(xpub, network);

    // Derivation path: m/0/index (Standard for receiving addresses from an xPub)
    const child = node.derive(0).derive(index);

    // Generate Bech32 (SegWit) address: starts with 'bc1' (mainnet) or 'tb1' (testnet)
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
    // FIX: Corrected URL path for Blockchain.com API
    const response = await axios.get(`https://blockchain.info{address}`);
    
    // The API returns a plain number string in Satoshis
    const totalReceivedSats = parseInt(response.data);
    
    if (isNaN(totalReceivedSats)) return 0;

    return totalReceivedSats / 100000000; // Convert Satoshis to BTC
  } catch (error) {
    console.warn(`[BTC Balance Check Failed] ${address}:`, error.message);
    return 0;
  }
};

// 🔗 ALIASES
export const deriveAddressFromXpub = deriveBtcAddress;
export const generateBitcoinAddress = deriveBtcAddress;

