import axios from 'axios';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import b58 from 'bs58check';

const bip32 = BIP32Factory(ecc);

const normalizeXpub = (extPubKey) => {
  if (!extPubKey) throw new Error("No Public Key provided");
  
  // Only normalize if it's not already a standard xpub
  if (extPubKey.startsWith('xpub')) return extPubKey;
  
  try {
    const data = b58.decode(extPubKey);
    // Replace version bytes with standard xpub (Mainnet)
    data.set([0x04, 0x88, 0xB2, 0x1E], 0); 
    return b58.encode(data);
  } catch (err) {
    throw new Error("Invalid Extended Public Key format (Checksum failed)");
  }
};

export const deriveBtcAddress = (extPubKey, index = 0) => {
  try {
    const xpub = normalizeXpub(extPubKey.trim());
    const network = bitcoin.networks.bitcoin;
    const node = bip32.fromBase58(xpub, network);

    // m/0/index
    const child = node.derive(0).derive(index);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network,
    });

    return address;
  } catch (error) {
    console.error(`[BTC_DERIVE_FAIL] Index ${index}:`, error.message);
    throw error;
  }
};

export async function getAddressBalance(address) {
  try {
    const token = process.env.BLOCKCYPHER_TOKEN;
    const baseUrl = `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`;
    const url = token ? `${baseUrl}?token=${token}` : baseUrl;
    
    const response = await axios.get(url, { timeout: 15000 });
    return (response.data.balance || 0) / 1e8;
  } catch (err) {
    // If 429, you've hit BlockCypher rate limits
    console.error("Balance API Error:", err.response?.status === 429 ? "Rate Limited" : err.message);
    return 0;
  }
}

