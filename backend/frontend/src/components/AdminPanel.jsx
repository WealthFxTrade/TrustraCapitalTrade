import { useState, useEffect } from 'react';

const BACKEND_URL = 'https://trustracapitaltrade-backend.onrender.com';

export default function AdminPanel({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold text-indigo-400 mb-8">Admin Panel</h1>
      <div className="bg-gray-800 rounded-xl p-8">
        <h2 className="text-2xl mb-6">All Users</h2>
        <ul className="space-y-4">
          {users.map(user => (
            <li key={user._id} className="bg-gray-900 p-4 rounded-lg">
              <p><strong>Name:</strong> {user.fullName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Balance:</strong> ${user.balance}</p>
              <p><strong>Plan:</strong> {user.plan}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
