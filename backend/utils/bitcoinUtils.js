import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import b58 from 'bs58check';

// CRITICAL FIX: Modern bitcoinjs-lib (v6+) requires this initialization
bitcoin.initEccLib(ecc); 

const bip32 = BIP32Factory(ecc);

export const deriveBtcAddress = (extPubKey, index = 0) => {
  try {
    if (!extPubKey) throw new Error("XPUB/ZPUB is required");

    // Standard xpub normalization logic (handles ypub/zpub)
    let xpub = extPubKey.trim(); 
    if (!xpub.startsWith('xpub')) {
      const data = b58.decode(xpub);
      data.set([0x04, 0x88, 0xB2, 0x1E], 0);
      xpub = b58.encode(data);
    }

    const network = bitcoin.networks.bitcoin;
    const node = bip32.fromBase58(xpub, network);
    
    // Path: m/0/index
    const child = node.derive(0).derive(index);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network,
    });

    if (!address) throw new Error("Generated address is undefined");
    return address;
  } catch (error) {
    console.error("Derivation Error:", error.message);
    throw error;
  }
};

