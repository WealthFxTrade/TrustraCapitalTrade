import Database from 'better-sqlite3';
import { deriveAddress } from '../config/bitcoin.js';
import path from 'path';

// SQLite database file
const DB_PATH = path.resolve('./btc_addresses.db');

// Initialize database
const db = new Database(DB_PATH);

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS address_index (
    id INTEGER PRIMARY KEY,
    last_index INTEGER NOT NULL
  )
`).run();

// Ensure there is one row to store last_index
const row = db.prepare('SELECT * FROM address_index WHERE id = 1').get();
if (!row) {
  db.prepare('INSERT INTO address_index (id, last_index) VALUES (1, 0)').run();
}

// ──────────────────────────────────────────────
// Helper: get last used index
const getLastIndex = () => {
  const row = db.prepare('SELECT last_index FROM address_index WHERE id = 1').get();
  return row.last_index;
};

// Helper: update last used index
const setLastIndex = (index) => {
  db.prepare('UPDATE address_index SET last_index = ? WHERE id = 1').run(index);
};

// ──────────────────────────────────────────────
// Generate a single BTC address and increment index
export const generateNextBtcAddress = (type = 'nativeSegwit') => {
  const lastIndex = getLastIndex();
  const nextIndex = lastIndex + 1;

  const { address, path, publicKey } = deriveAddress(nextIndex, type);

  setLastIndex(nextIndex);

  return { index: nextIndex, address, path, pubKey: publicKey.toString('hex') };
};

// ──────────────────────────────────────────────
// Generate multiple BTC addresses at once
export const generateNextBtcAddresses = (count = 1, type = 'nativeSegwit') => {
  const addresses = [];
  let lastIndex = getLastIndex();

  for (let i = 0; i < count; i++) {
    const nextIndex = lastIndex + 1;
    const { address, path, publicKey } = deriveAddress(nextIndex, type);

    addresses.push({
      index: nextIndex,
      address,
      path,
      pubKey: publicKey.toString('hex'),
    });

    lastIndex = nextIndex;
  }

  setLastIndex(lastIndex);
  return addresses;
};

// ──────────────────────────────────────────────
// Example usage
if (require.main === module) {
  console.log('Next BTC address:', generateNextBtcAddress());
  console.log('Next 5 BTC addresses:');
  console.table(generateNextBtcAddresses(5));
}
