import NodeCache from 'node-cache';
// stdTTL: 60 (1 min), checkperiod: 120 (delete expired keys every 2 mins)
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
export default cache;

