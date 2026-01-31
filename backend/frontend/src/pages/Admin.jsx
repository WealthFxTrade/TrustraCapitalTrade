import { useEffect, useState } from 'react';
import { apiGet, apiPut, apiDelete } from '../api';

export default function Admin() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const data = await apiGet('/admin/users');
    setUsers(data);
  };

  useEffect(() => { loadUsers(); }, []);

  const updateUser = async (userId, balance, plan) => {
    const res = await apiPut(`/admin/users/${userId}`, { balance, plan });
    alert(res.message);
    loadUsers();
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;
    const res = await apiDelete(`/admin/users/${userId}`);
    alert(res.message);
    loadUsers();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <table className="w-full table-auto border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Balance</th>
            <th className="px-4 py-2">Plan</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-900">
          {users.map(user => (
            <tr key={user._id} className="border-b border-gray-700">
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  defaultValue={user.balance || 0}
                  id={`balance-${user._id}`}
                  className="w-20 bg-gray-800 text-white p-1 rounded"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  defaultValue={user.plan || ''}
                  id={`plan-${user._id}`}
                  className="bg-gray-800 text-white p-1 rounded"
                />
              </td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  onClick={() => updateUser(user._id,
                    document.getElementById(`balance-${user._id}`).value,
                    document.getElementById(`plan-${user._id}`).value
                  )}
                  className="px-3 py-1 bg-green-600 rounded text-white"
                >Update</button>
                <button
                  onClick={() => deleteUser(user._id)}
                  className="px-3 py-1 bg-red-600 rounded text-white"
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
    }
