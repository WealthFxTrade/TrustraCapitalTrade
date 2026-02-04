import bip32 from 'bip32';
import bitcoin from 'bitcoinjs-lib';
import axios from 'axios';

const network = bitcoin.networks.bitcoin;
const node = bip32.fromBase58(process.env.BTC_MASTER_XPUB, network);

export const generateUserAddress = (index) => {
  const child = node.derive(index);
  return bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network }).address;
};

export const getAddressUTXOs = async (address) => {
  try {
    const res = await axios.get(`https://blockstream.info/api/address/${address}/utxo`);
    return res.data;
  } catch (err) {
    console.error('[BTC UTXO ERROR]', err.message);
    return [];
  }
};
