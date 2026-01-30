// backend/config/bitcoin.js
import dotenv from "dotenv";
import bip32 from "bip32";
import bitcoin from "bitcoinjs-lib";

dotenv.config();

if (!process.env.BITCOIN_XPUB) {
  throw new Error("BITCOIN_XPUB is not defined in environment variables. Set it to your xpub/ypub/zpub key.");
}

// Export root and network for ES modules
export const root = bip32.fromBase58(process.env.BITCOIN_XPUB);
export const network = bitcoin.networks.bitcoin;
