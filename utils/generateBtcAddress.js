// backend/utils/generateBtcAddress.js
import bitcoin from "bitcoinjs-lib";
import { root, network } from "../config/bitcoin.js";

// Generate BTC address for a given index
export function generateAddress(index) {
  if (!root) throw new Error("root not defined in bitcoin config");

  const child = root.derivePath(`0/${index}`);
  const { address } = bitcoin.payments.p2pkh({
    pubkey: child.publicKey,
    network,
  });
  return address;
}

// ES-module replacement for require.main
async function main() {
  try {
    const address = generateAddress(0);
    console.log("Generated BTC address:", address);
  } catch (err) {
    console.error(err);
  }
}

// Run this file directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
