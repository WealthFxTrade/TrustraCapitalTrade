import Agenda from 'agenda';
import axios from 'axios';
import mongoose from 'mongoose';
import { confirmDeposit } from '../services/financeService.js';

const agenda = new Agenda({ db: { address: process.env.MONGO_URI, collection: 'agendaJobs' } });

agenda.define('sync_blockchain_deposits', async (job) => {
  const Deposit = mongoose.model('Deposit');
  const pending = await Deposit.find({ status: 'pending' }).limit(10);

  for (const dep of pending) {
    try {
      // Real Blockchain verification via BlockCypher
      const url = `https://api.blockcypher.com{dep.txHash}`;
      const { data } = await axios.get(url);
      
      // Check confirmations (min 3 for production)
      if (data.confirmations >= 3) {
        await confirmDeposit(dep._id);
      }
    } catch (error) {
      console.error(`Blockchain sync failed for ${dep.txHash}:`, error.message);
    }
  }
});

export default agenda;

