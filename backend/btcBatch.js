import 'dotenv/config';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);
const xpub = process.env.BITCOIN_XPUB;

if (!xpub) {
    console.error("⚠️ BITCOIN_XPUB is not defined in .env");
    process.exit(1);
}

try {
    const node = bip32.fromBase58(xpub.trim(), bitcoin.networks.bitcoin);
    const child = node.derive(0).derive(0);
    const { address } = bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: bitcoin.networks.bitcoin,
    });

    console.log("✅ Successfully loaded XPUB");
    console.log("✅ Derived BTC address:", address);
} catch (error) {
    console.error("❌ Error processing XPUB:", error.message);
}

