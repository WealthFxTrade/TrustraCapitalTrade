// backend/utils/bitcoinUtils.js
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

/**
 * Derive native SegWit (bech32) BTC address from XPUB using HD derivation
 * Production standard: m/84'/0'/0'/0/index (BIP84)
 */
export const deriveBtcAddress = (index = 0) => {
  const XPUB = process.env.BTC_XPUB || process.env.BITCOIN_XPUB;
  if (!XPUB) {
    throw new Error('BTC_XPUB environment variable is required for address derivation');
  }

  const network = process.env.BITCOIN_NETWORK === 'testnet'
    ? bitcoin.networks.testnet
    : bitcoin.networks.bitcoin;

  try {
    const node = bip32.fromBase58(XPUB, network);
    const child = node.derive(0).derive(index);   // External chain (0)

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network
    });

    if (!address) {
      throw new Error('Failed to derive BTC address');
    }

    console.log(`[BTC DERIVATION] Index \( {index} → \){address}`);
    return { address, path: `m/84'/0'/0'/0/${index}` };
  } catch (error) {
    console.error(`[BTC DERIVATION ERROR] Index ${index}:`, error.message);
    throw new Error(`BTC address derivation failed: ${error.message}`);
  }
};
