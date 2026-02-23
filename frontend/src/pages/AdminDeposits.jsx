import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDeposits = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const { data } = await axios.get('/api/users');
    setUsers(data.users);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (userId, transactionId) => {
    try {
      await axios.post('/api/users/approve-deposit', { userId, transactionId });
      alert("Deposit Approved!");
      fetchUsers(); // Refresh list
    } catch (err) {
      alert("Error approving deposit");
    }
  };

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Pending Deposits</h1>
      <div className="space-y-4">
        {users.map(user => (
          user.ledger.filter(t => t.status === 'pending' && t.type === 'deposit').map(tx => (
            <div key={tx._id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-center border border-slate-700">
              <div>
                <p className="font-bold">{user.fullName} ({user.email})</p>
                <p className="text-green-400 text-xl">${tx.amount}</p>
                <p className="text-sm text-slate-400">Target: {tx.currency}</p>
              </div>
              <button 
                onClick={() => handleApprove(user._id, tx._id)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full font-bold transition"
              >
                Confirm Payment
              </button>
            </div>
          ))
        ))}
      </div>
    </div>
  );
};

export default AdminDeposits;

