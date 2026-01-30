import * as bitcoin from 'bitcoinjs-lib';
import { root, network } from '../config/bitcoin.js';

export const generateBtcAddress = (index) => {
  const child = root.derive(0).derive(index);
  return bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network
  }).address;
};
