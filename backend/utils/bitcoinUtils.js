// backend/utils/bitcoinUtils.js
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import b58 from 'bs58check';

const bip32 = BIP32Factory(ecc);

/**
 * Normalizes a zpub/vpub prefix to a standard xpub/tpub prefix readable by bitcoinjs-lib
 */
const normalizeXpub = (xpub, isTestnet) => {
  if (!xpub.startsWith('zpub') && !xpub.startsWith('vpub')) {
    return xpub;
  }

  const data = b58.decode(xpub);
  // Mainnet xpub prefix: 0x0488B21E | Testnet tpub prefix: 0x043587CF
  const targetPrefix = isTestnet ? Buffer.from('043587cf', 'hex') : Buffer.from('0488b21e', 'hex');
  
  targetPrefix.copy(data, 0, 0, 4);
  return b58.encode(data);
};

/**
 * Derive native SegWit (bech32) BTC address from XPUB using HD derivation
 * Production standard: m/84'/0'/0'/0/index (BIP84)
 */
export const deriveBtcAddress = (index = 0) => {
  let XPUB = process.env.BTC_XPUB || process.env.BITCOIN_XPUB;
  if (!XPUB) {
    throw new Error('BTC_XPUB environment variable is required for address derivation');
  }

  const isTestnet = process.env.BITCOIN_NETWORK === 'testnet';
  const network = isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

  try {
    // Convert zpub/vpub standard identifiers if passed in from environment files
    XPUB = normalizeXpub(XPUB, isTestnet);

    const node = bip32.fromBase58(XPUB, network);
    const child = node.derive(0).derive(index);   // External chain (0)

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network
    });

    if (!address) {
      throw new Error('Failed to derive BTC address');
    }

    // FIXED: Escaped interpolation sequence breaking standard variable execution output
    console.log(`[BTC DERIVATION] Index ${index} → ${address}`);
    return { address, path: `m/84'/0'/0'/0/${index}` };
  } catch (error) {
    console.error(`[BTC DERIVATION ERROR] Index ${index}:`, error.message);
    throw new Error(`BTC address derivation failed: ${error.message}`);
  }
};
