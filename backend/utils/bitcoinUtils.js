import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

/**
 * Derive BTC address from XPUB
 */
export const deriveBtcAddress = (index = 0) => {
  // ✅ ALWAYS read env at runtime (NOT import time)
  const XPUB = process.env.BTC_XPUB || process.env.BITCOIN_XPUB;

  if (!XPUB) {
    throw new Error("BTC_XPUB / BITCOIN_XPUB is missing in environment variables");
  }

  const network =
    process.env.BITCOIN_NETWORK === 'testnet'
      ? bitcoin.networks.testnet
      : bitcoin.networks.bitcoin;

  try {
    const node = bip32.fromBase58(XPUB, network);

    const child = node.derive(0).derive(index);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network
    });

    if (!address) {
      throw new Error("Failed to derive BTC address - address returned undefined");
    }

    return { address };
  } catch (error) {
    console.error(`[DERIVATION_ERROR] Index ${index}:`, error.message);
    throw new Error(`BTC address derivation failed: ${error.message}`);
  }
};
