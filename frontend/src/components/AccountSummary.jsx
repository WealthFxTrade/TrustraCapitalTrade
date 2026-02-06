import { useEffect, useState } from 'react';
import axios from 'axios';

const AccountSummary = () => {
  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    try {
      // Assuming a new endpoint to get logged-in user's data
      const { data } = await axios.get('/api/me'); 
      setUserData(data);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  useEffect(() => { fetchUserData(); }, []);

  if (!userData) {
    return <div className="p-8 text-white">Loading account data...</div>;
  }

  return (
    <div className="p-8 bg-slate-900 text-white">
      <h2 className="text-2xl font-bold mb-4">Account Summary</h2>
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <p className="font-bold">Welcome, {userData.fullName}!</p>
        <p className="text-slate-400">Email: {userData.email}</p>

        <h3 className="text-xl font-bold mt-4 mb-2">Balances:</h3>
        {Object.entries(userData.balances).map(([currency, amount]) => (
          <p key={currency} className="text-green-400">
            {currency}: ${amount.toFixed(2)}
          </p>
        ))}

        <h3 className="text-xl font-bold mt-4 mb-2">Recent Transactions:</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto"> {/* Added scrolling for transactions */}
          {userData.ledger.slice(0, 5).map(tx => ( // Displaying a few recent transactions
            <div key={tx._id} className="bg-slate-700 p-2 rounded-md text-sm">
              <p>{new Date(tx.createdAt).toLocaleDateString()}: {tx.type} of ${tx.amount} ({tx.currency}) - Status: {tx.status}</p>
            </div>
          ))}
          {userData.ledger.length === 0 && <p className="text-slate-400">No transactions yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;

