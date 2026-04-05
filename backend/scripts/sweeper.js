import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
const MASTER_WALLET = '0x9830440e9257f33afc29c8e3f35a7681920379d4';
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

const USDT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

async function sweepUserAddress(userIndex) {
  const mnemonic = ethers.Mnemonic.fromPhrase(process.env.ETH_MNEMONIC);
  const userWallet = ethers.HDNodeWallet.fromMnemonic(
    mnemonic, 
    `m/44'/60'/0'/0/${userIndex}`
  ).connect(provider);

  console.log(`Checking Address: ${userWallet.address}`);

  const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, userWallet);
  const balance = await usdtContract.balanceOf(userWallet.address);

  if (balance > 0n) {
    console.log(`Target Found! ${ethers.formatUnits(balance, 6)} USDT detected.`);

    // 1. Check if user address has ETH for gas
    const ethBalance = await provider.getBalance(userWallet.address);
    const gasPrice = (await provider.getFeeData()).gasPrice;
    const gasLimit = 60000n; // Estimate for USDT transfer
    const requiredGas = gasPrice * gasLimit;

    if (ethBalance < requiredGas) {
      console.log("Funding user address with gas...");
      const mainWallet = new ethers.Wallet(process.env.MASTER_PRIVATE_KEY, provider);
      const tx = await mainWallet.sendTransaction({
        to: userWallet.address,
        value: requiredGas - ethBalance + ethers.parseEther("0.001") // Adding a buffer
      });
      await tx.wait();
    }

    // 2. Perform the Sweep
    console.log("Executing Sweep to Master Wallet...");
    const sweepTx = await usdtContract.transfer(MASTER_WALLET, balance);
    await sweepTx.wait();
    console.log(`Successfully swept to ${MASTER_WALLET}`);
  } else {
    console.log("No balance found. Skipping.");
  }
}
