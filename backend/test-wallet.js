// backend/test-wallet.js
import dotenv from 'dotenv';
dotenv.config();

import { ethers } from 'ethers';
import bip39 from 'bip39';
import bitcoin from 'bitcoinjs-lib';
import bip32 from 'bip32';

(async () => {
  try {
    // Ethereum Wallet
    const ethWallet = ethers.Wallet.fromMnemonic(process.env.ETH_MNEMONIC);
    console.log('Ethereum Address:', ethWallet.address);

    // Bitcoin Wallet
    const seed = await bip39.mnemonicToSeed(process.env.ETH_MNEMONIC);
    const root = bip32.fromSeed(seed, bitcoin.networks.bitcoin);
    const btcNode = root.derivePath("m/84'/0'/0'/0/0");
    const { address } = bitcoin.payments.p2wpkh({ pubkey: btcNode.publicKey });
    console.log('Bitcoin Address:', address);

    console.log('✅ Wallets generated successfully');
  } catch (err) {
    console.error('❌ Wallet Test Error:', err.message);
  }
})();
