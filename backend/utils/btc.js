import bip32 from 'bip32';
import bitcoin from 'bitcoinjs-lib';

const network = bitcoin.networks.bitcoin; // mainnet

const masterXpub = process.env.BTC_MASTER_XPUB;

if (!masterXpub) throw new Error("BTC_MASTER_XPUB not set in .env");

const root = bip32.fromBase58(masterXpub, network);

/**
 * Generate deterministic BTC address per user
 * @param {number} index - unique integer per user (e.g., user._id or incremental)
 */
export function getUserBTCAddress(index) {
  const child = root.derive(0).derive(index); // m/0/index
  const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network });
  return address;
}
