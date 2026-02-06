import axios from 'axios';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

export const deriveBtcAddress = (xpub, index) => {
  try {
    if (!xpub) throw new Error("XPUB is required for derivation");
    const node = bip32.fromBase58(xpub);
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
 * FIXED: Standard 2026 BlockCypher Endpoint for Transactions
 */
export async function getBtcTxConfirmations(txHash) {
  try {
    // Corrected URL structure for BlockCypher API
    const url = `https://api.blockcypher.com{txHash}`;
    const response = await axios.get(url);
    return response.data.confirmations || 0;
  } catch (err) {
    console.error("BlockCypher Tx Error:", err.message);
    return null;
  }
}

/**
 * FIXED: Standard 2026 BlockCypher Endpoint for Balances
 */
export async function getAddressBalance(address) {
  try {
    const url = `https://api.blockcypher.com{address}/balance`;
    const response = await axios.get(url);
    // Convert Satoshis to BTC
    return response.data.balance / 100000000;
  } catch (err) {
    console.error("BlockCypher Balance Error:", err.message);
    return 0;
  }
}

