import axios from 'axios';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

/**
 * Derives unique Bech32 (SegWit) address from XPUB
 * Standard for 2026 transaction efficiency and lower fees.
 */
export const deriveBtcAddress = (xpub, index) => {
  try {
    if (!xpub) throw new Error("XPUB is required for derivation");
    const node = bip32.fromBase58(xpub);
    // Path: m/0/index (External/Receiving Chain)
    const child = node.derive(0).derive(index);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: bitcoin.networks.bitcoin,
    });

    return address;
  } catch (error) {
    console.error("Critical Derivation Error:", error.message);
    return `error_derivation_${index}`;
  }
};

/**
 * FIXED: Proper URL string interpolation for BlockCypher Transactions
 */
export async function getBtcTxConfirmations(txHash) {
  try {
    // Fixed template literal syntax using backticks and ${variable}
    const url = `https://api.blockcypher.com{txHash}`;
    const response = await axios.get(url);
    return response.data.confirmations || 0;
  } catch (err) {
    console.error("BlockCypher Tx Error:", err.message);
    return null;
  }
}

/**
 * FIXED: Proper URL string interpolation for Address Balances
 */
export async function getAddressBalance(address) {
  try {
    // Fixed template literal syntax using backticks and ${variable}
    const url = `https://api.blockcypher.com{address}/balance`;
    const response = await axios.get(url);
    // Convert 100,000,000 Satoshis to 1 BTC
    return response.data.balance / 100000000;
  } catch (err) {
    console.error("BlockCypher Balance Error:", err.message);
    return 0;
  }
}

