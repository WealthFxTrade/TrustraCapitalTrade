import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  fetchUserProfile,
  fetchWallets,
  fetchInvestments,
  fetchUsers,
  distributeProfit,
  deleteUser,
} from '../../api/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [users, setUsers] = useState([]); // Admin only
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1️⃣ Fetch user profile
        const userProfile = await fetchUserProfile();
        setUser(userProfile);

        // 2️⃣ Fetch wallets
        const walletData = await fetchWallets();
        setWallets(walletData);

        // 3️⃣ Fetch investments
        const investmentData = await fetchInvestments();
        setInvestments(investmentData);

        // 4️⃣ If admin, fetch users
        if (userProfile.role === 'admin') {
          const userList = await fetchUsers();
          setUsers(userList);
        }
      } catch (err) {
        console.error('[Dashboard Load Error]', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDistributeProfit = async () => {
    try {
      await distributeProfit({ amount: 1000 }); // Example data
      toast.success('Profit distributed successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to distribute profit');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user');
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-8">
      {/* User Info */}
      <div>
        <h2 className="text-xl font-bold">Welcome, {user.name}</h2>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
      </div>

      {/* Wallets */}
      <div>
        <h3 className="font-semibold">Wallets</h3>
        <ul>
          {wallets.map((w) => (
            <li key={w._id}>
              {w.currency}: {w.balance}
            </li>
          ))}
        </ul>
      </div>

      {/* Investments */}
      <div>
        <h3 className="font-semibold">Investments</h3>
        <ul>
          {investments.map((i) => (
            <li key={i._id}>
              {i.planName}: {i.amount} ({i.status})
            </li>
          ))}
        </ul>
      </div>

      {/* Admin Section */}
      {user.role === 'admin' && (
        <div>
          <h3 className="font-semibold">Admin Panel</h3>
          <button
            onClick={handleDistributeProfit}
            className="bg-yellow-500 text-black px-4 py-2 rounded mr-2"
          >
            Distribute Profit
          </button>

          <ul className="mt-4">
            {users.map((u) => (
              <li key={u._id} className="flex justify-between items-center">
                <span>{u.email} ({u.role})</span>
                <button
                  onClick={() => handleDeleteUser(u._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
