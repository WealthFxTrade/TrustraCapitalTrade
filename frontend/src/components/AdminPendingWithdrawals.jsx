// src/components/AdminPendingWithdrawals.jsx
import { usePendingWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from '../hooks/useAdmin';
import { useState } from 'react';

export default function AdminPendingWithdrawals() {
  const { data, isLoading } = usePendingWithdrawals();
  const approveMutation = useApproveWithdrawal();
  const rejectMutation = useRejectWithdrawal();
  const [reason, setReason] = useState('');

  if (isLoading) return <p>Loading pending withdrawals...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Pending Withdrawals</h2>
      {data.withdrawals.length === 0 && <p>No pending withdrawals.</p>}
      <table className="border w-full text-left">
        <thead>
          <tr>
            <th className="border p-1">User</th>
            <th className="border p-1">Email</th>
            <th className="border p-1">Amount</th>
            <th className="border p-1">BTC Address</th>
            <th className="border p-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.withdrawals.map((w) => (
            <tr key={w._id}>
              <td className="border p-1">{w.user.fullName}</td>
              <td className="border p-1">{w.user.email}</td>
              <td className="border p-1">{w.amount} BTC</td>
              <td className="border p-1">{w.btcAddress}</td>
              <td className="border p-1 space-x-2">
                <button
                  onClick={() => {
                    const txHash = prompt('Enter transaction hash:');
                    if (txHash) approveMutation.mutate({ id: w._id, txHash });
                  }}
                  className="bg-green-500 text-white px-2 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => {
                    const r = prompt('Reason for rejection:');
                    if (r) rejectMutation.mutate({ id: w._id, reason: r });
                  }}
                  className="bg-red-500 text-white px-2 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
