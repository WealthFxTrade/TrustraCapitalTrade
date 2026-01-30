import * as bitcoin from 'bitcoinjs-lib';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

export const network = bitcoin.networks.bitcoin;
export const root = bip32.fromBase58(process.env.BITCOIN_XPUB, network);
