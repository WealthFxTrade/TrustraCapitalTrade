// env.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeEnv = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, nodeEnv === 'production' ? '.env.production' : '.env.development');

console.log(`🔧 [ENV] Loading environment file: ${envPath}`);

dotenv.config({ path: envPath });

// Critical validation for Ethereum RPC
if (!process.env.ETH_RPC_URL) {
  console.error(`❌ [ENV] CRITICAL: ETH_RPC_URL is missing in ${nodeEnv} environment!`);
  console.error('Please check your .env.development or .env.production file.');
} else {
  console.log(`✅ [ENV] ETH_RPC_URL loaded successfully (starts with: ${process.env.ETH_RPC_URL.substring(0, 40)}...)`);
}

// Optional: Log fallback RPCs
if (process.env.ETH_FALLBACK_RPC) {
  console.log(`✅ [ENV] Fallback RPCs loaded (${process.env.ETH_FALLBACK_RPC})`);
}

// Export the environment variables so other files can access process.env properly
export default process.env;
