import { useEffect, useState } from 'react';
import { apiGet } from '../api';
import InvestModal from '../components/InvestModal';

export default function Dashboard() {
  const [user, setUser] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    apiGet('/user/me').then(setUser);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Email: {user.email}</p>
      <p>Balance: ${user.balance}</p>
      <p>Plan: {user.plan}</p>

      <button
        onClick={() => setShowModal(true)}
        className="mt-4 px-6 py-2 bg-indigo-600 rounded font-bold"
      >
        Invest Now
      </button>

      <InvestModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
    }
