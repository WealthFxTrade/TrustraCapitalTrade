import axios from 'axios';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

/**
 * Derives a Native SegWit (bc1) address
 */
export const deriveBtcAddress = (xpub, index) => {
  try {
    if (!xpub) return `bc1_mock_${index}`;
    const node = bip32.fromBase58(xpub);
    const child = node.derive(0).derive(index);
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: bitcoin.networks.bitcoin,
    });
    return address;
  } catch (error) {
    console.error("Derivation Error:", error);
    return `bc1_error_${index}`;
  }
};

// ADD THIS ALIAS HERE to fix the SyntaxError in addressService.js
export const deriveAddressFromXpub = deriveBtcAddress;

/**
 * Get BTC transaction details
 */
export async function getBtcTxConfirmations(txHash) {
  try {
    const url = `https://api.blockcypher.com{txHash}`;
    const response = await axios.get(url);
    return response.data.confirmations || 0;
  } catch (err) {
    return null;
  }
}

/**
 * Check balance
 */
export async function getAddressBalance(address) {
  try {
    const url = `https://api.blockcypher.com{address}/balance`;
    const response = await axios.get(url);
    return response.data.balance / 100000000;
  } catch (err) {
    return 0;
  }
}

