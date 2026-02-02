// backend/services/btcWatcher.js
import axios from 'axios';
import Deposit from '../models/Deposit.js';
import { confirmDeposit } from './confirmDeposit.js';
import { root, network, addressType } from '../config/bitcoin.js';

// How often to poll the blockchain (ms)
const POLL_INTERVAL = 30_000; // 30 seconds

/**
 * Derive the BTC address for a deposit index
 * @param {number} index - derivation index
 */
function deriveAddress(index) {
  const child = root.derivePath(`0/${index}`);
  switch (addressType) {
    case 'native-segwit':
      return bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network }).address;
    case 'nested-segwit':
      return bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network }),
        network,
      }).address;
    default:
      return bitcoin.payments.p2pkh({ pubkey: child.publicKey, network }).address;
  }
}

/**
 * Poll blockchain API for a single deposit address
 * Updates deposit record with confirmations
 */
async function checkDepositTx(deposit) {
  try {
    // Example using Blockstream API for BTC mainnet
    const resp = await axios.get(`https://blockstream.info/api/address/${deposit.address}/txs`);
    const txs = resp.data;

    for (const tx of txs) {
      // Only consider txs that include this address as output
      const outputToAddress = tx.vout.some(
        (vout) => vout.scriptpubkey_address === deposit.address
      );
      if (!outputToAddress) continue;

      const confirmations = tx.status.confirmed ? tx.status.confirmations : 0;

      // Update deposit confirmations
      deposit.confirmations = confirmations;

      // Update receivedAmount (BTC → satoshis)
      const received = tx.vout
        .filter((vout) => vout.scriptpubkey_address === deposit.address)
        .reduce((sum, vout) => sum + Math.round(vout.value), 0); // value in satoshis

      deposit.receivedAmount = received;
      deposit.amountSat = received; // store internally in satoshis

      await deposit.save();

      // If enough confirmations, confirm deposit & credit user
      if (confirmations >= 3 && deposit.status !== 'confirmed') {
        await confirmDeposit(deposit._id);
      }
    }
  } catch (err) {
    console.error(`Error checking deposit ${deposit._id}:`, err.message);
  }
}

/**
 * Main watcher loop
 */
export async function startBtcWatcher() {
  console.log('BTC watcher started');

  setInterval(async () => {
    try {
      // Find deposits that are not yet confirmed or expired
      const deposits = await Deposit.find({
        status: { $in: ['pending', 'confirming'] },
      }).sort({ createdAt: 1 });

      for (const dep of deposits) {
        await checkDepositTx(dep);
      }
    } catch (err) {
      console.error('BTC watcher loop error:', err.message);
    }
  }, POLL_INTERVAL);
}
