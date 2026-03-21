// backend/utils/bitcoinUtils.js
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

const bip32 = BIP32Factory(ecc);
const MEMPOOL_MAINNET = 'https://mempool.space/api';

export function deriveBtcAddress(xpub, index = 0) {
  const targetXpub = xpub || process.env.BITCOIN_XPUB;
  if (!targetXpub) throw new Error('XPUB is required');

  try {
    const network = bitcoin.networks.bitcoin;
    const node = bip32.fromBase58(targetXpub, network);
    const child = node.derive(0).derive(index);

    // If xpub starts with 'xpub', it's Legacy (BIP44) -> Use p2pkh (Address starts with 1)
    if (targetXpub.startsWith('xpub')) {
      const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey, network });
      return address;
    } 
    
    // Otherwise, assume Native SegWit (BIP84) -> Use p2wpkh (Address starts with bc1q)
    const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network });
    return address;
  } catch (err) {
    throw new Error(`Derivation failed: ${err.message}`);
  }
}

export async function getBtcBalance(address) {
  if (!address) return 0;
  try {
    const res = await axios.get(`${MEMPOOL_MAINNET}/address/${address}`);
    const { chain_stats, mempool_stats } = res.data;
    const totalSatoshis = (chain_stats.funded_txo_sum - chain_stats.spent_txo_sum) + 
                         (mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum);
    return totalSatoshis / 100_000_000;
  } catch (err) {
    return 0;
  }
}
