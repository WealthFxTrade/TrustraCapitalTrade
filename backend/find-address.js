const bitcoin = require('bitcoinjs-lib');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');
const bip32 = BIP32Factory(ecc);

const XPUB = "xpub661MyMwAqRbcFjNfxS85kX6EHazWHT8o1QY6kgWgrvbAcfNcrkWkUHjMzgEyVyVyxfoFtatep7C6kDh4D57ELppsTR78sU8xaecLx22Fkvx";
const TARGET = "bc1qj4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq";

const node = bip32.fromBase58(XPUB);

console.log(`🔍 Scanning BIP84 path for: ${TARGET}\n`);

for (let i = 0; i < 100; i++) {
    // BIP84 Native SegWit usually follows m/84'/0'/0'/0/i
    // Since your XPUB is likely at the account level (m/84'/0'/0'), we derive 0/i
    const child = node.derive(0).derive(i); 
    const { address } = bitcoin.payments.p2wpkh({ 
        pubkey: child.publicKey, 
        network: bitcoin.networks.mainnet 
    });

    if (address === TARGET) {
        console.log(`✅ MATCH FOUND at Index: ${i}`);
        process.exit(0);
    }
    if (i % 20 === 0) console.log(`Checked up to index ${i}...`);
}

console.log("❌ Not found in first 100 indices.");

