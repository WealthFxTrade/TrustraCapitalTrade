// src/components/admin/UserManagementTable.jsx
import { useState, useEffect } from 'react';
import { Search, UserCog, Ban, CheckCircle, XCircle, Loader2, Eye, Trash2, Key } from 'lucide-react';
import Modal from '../../components/Modal'; // your reusable modal component

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

export default function UserManagementTable({ token, logout }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPlan, setNewPlan] = useState('');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load users');

      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.fullName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term) ||
      user.plan?.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Open edit plan modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewPlan(user.plan || 'none');
    setShowEditModal(true);
  };

  // Save plan change
  const savePlanChange = async () => {
    try {
      const res = await fetch(`\( {BACKEND_URL}/api/admin/users/ \){selectedUser._id}/plan`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: newPlan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update plan');

      alert('Plan updated successfully');
      fetchUsers(); // refresh list
      setShowEditModal(false);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Ban / Unban
  const handleBanToggle = async (user) => {
    const action = user.banned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await fetch(`\( {BACKEND_URL}/api/admin/users/ \){user._id}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ban/unban failed');

      alert(`User ${action}ned successfully`);
      fetchUsers(); // refresh
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Delete user
  const handleDelete = async (user) => {
    if (!window.confirm(`PERMANENTLY delete user ${user.email}? This cannot be undone.`)) return;

    try {
      const res = await fetch(`\( {BACKEND_URL}/api/admin/users/ \){user._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Delete failed');

      alert('User permanently deleted');
      fetchUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Reset password
  const handleResetPassword = async (user) => {
    if (!window.confirm(`Reset password for ${user.email}?`)) return;

    try {
      const res = await fetch(`\( {BACKEND_URL}/api/admin/users/ \){user._id}/reset-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');

      alert(`Password reset. Temporary password: ${data.temporaryPassword}`);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // View details
  const openDetailsModal = async (user) => {
    setSelectedUser(user);
    setUserDetails(null);
    setDetailsLoading(true);
    setShowDetailsModal(true);

    try {
      const res = await fetch(`\( {BACKEND_URL}/api/admin/users/ \){user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load details');

      setUserDetails(data);
    } catch (err) {
      setError('Failed to load user details');
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading users...</div>;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-gray-400 text-sm">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Balance</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="p-4">{user.fullName || '—'}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">{user.plan}</td>
                <td className="p-4 font-medium text-green-400">${user.balance?.toLocaleString() || '0.00'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.banned ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'
                  }`}>
                    {user.banned ? 'BANNED' : 'ACTIVE'}
                  </span>
                </td>
                <td className="p-4 text-right flex gap-2 justify-end flex-wrap">
                  <button
                    onClick={() => openDetailsModal(user)}
                    className="p-2 text-blue-400 hover:text-blue-300"
                    title="View details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-2 text-indigo-400 hover:text-indigo-300"
                    title="Edit plan"
                  >
                    <UserCog size={18} />
                  </button>
                  <button
                    onClick={() => handleBanToggle(user)}
                    className={`p-2 ${user.banned ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}`}
                    title={user.banned ? 'Unban' : 'Ban'}
                  >
                    <Ban size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="p-2 text-red-500 hover:text-red-400"
                    title="Delete user"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => handleResetPassword(user)}
                    className="p-2 text-yellow-400 hover:text-yellow-300"
                    title="Reset password"
                  >
                    <Key size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Plan Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Plan - ${selectedUser?.fullName || selectedUser?.email}`}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Plan</label>
            <p className="text-white">{selectedUser?.plan || 'none'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Plan</label>
            <select
              value={newPlan}
              onChange={e => setNewPlan(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="none">None</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={savePlanChange}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`User Details - ${selectedUser?.fullName || selectedUser?.email}`}
        maxWidth="max-w-3xl"
      >
        {detailsLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
          </div>
        ) : userDetails ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-2">Profile</h4>
                <p><strong>Name:</strong> {userDetails.fullName || '—'}</p>
                <p><strong>Email:</strong> {userDetails.email}</p>
                <p><strong>Role:</strong> {userDetails.role}</p>
                <p><strong>Plan:</strong> {userDetails.plan}</p>
                <p><strong>Balance:</strong> <span className="text-green-400">${userDetails.balance?.toLocaleString() || '0.00'}</span></p>
                <p><strong>Status:</strong> {userDetails.banned ? 'BANNED' : 'ACTIVE'}</p>
                <p><strong>Joined:</strong> {new Date(userDetails.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {userDetails.recentDeposits?.length > 0 && (
                    <div>
                      <p className="font-medium">Deposits</p>
                      {userDetails.recentDeposits.map(d => (
                        <p key={d._id} className="text-sm">
                          {d.amount} {d.currency} — {new Date(d.createdAt).toLocaleDateString()}
                        </p>
                      ))}
                    </div>
                  )}
                  {userDetails.recentWithdrawals?.length > 0 && (
                    <div>
                      <p className="font-medium">Withdrawals</p>
                      {userDetails.recentWithdrawals.map(w => (
                        <p key={w._id} className="text-sm">
                          {w.amount} BTC ({w.status}) — {new Date(w.createdAt).toLocaleDateString()}
                        </p>
                      ))}
                    </div>
                  )}
                  {!userDetails.recentDeposits?.length && !userDetails.recentWithdrawals?.length && (
                    <p className="text-gray-400">No recent activity</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <p className="text-red-400 text-center py-8">Failed to load details</p>
        )}
      </Modal>
    </div>
  );
}
