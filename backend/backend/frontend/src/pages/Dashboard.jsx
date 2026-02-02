import { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { request } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ user }) {
  const [btcPrice, setBtcPrice] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [btcBalance, setBtcBalance] = useState(0);
  const { token } = useAuth();

  // Fetch user investments
  useEffect(() => {
    async function fetchInvestments() {
      try {
        const data = await request('/investments', 'GET', null, token);
        setInvestments(data.investments);
      } catch (err) {
        console.error(err.message);
      }
    }
    fetchInvestments();
  }, [token]);

  // Fetch BTC price
  useEffect(() => {
    async function fetchBtcPrice() {
      try {
        const data = await request('/bitcoin/price', 'GET');
        setBtcPrice(data.price);
      } catch (err) {
        console.error(err.message);
      }
    }
    fetchBtcPrice();
  }, []);

  // Fetch BTC balance
  useEffect(() => {
    async function fetchBtcBalance() {
      try {
        const data = await request(`/bitcoin/balance/${user.id}`, 'GET', null, token);
        setBtcBalance(data.balance);
      } catch (err) {
        console.error(err.message);
      }
    }
    fetchBtcBalance();
    const interval = setInterval(fetchBtcBalance, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [user.id, token]);

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user.fullName}</h1>

      <section className="btc-address">
        <h2>Your BTC Deposit Address</h2>
        <p>{user.btcAddress}</p>
        <QRCode value={user.btcAddress} size={128} />
        <button onClick={() => navigator.clipboard.writeText(user.btcAddress)}>
          Copy Address
        </button>
      </section>

      <section className="btc-balance">
        <h2>Your BTC Balance</h2>
        <p>{btcBalance} BTC</p>
        <p>≈ ${btcBalance && btcPrice ? (btcBalance * btcPrice).toFixed(2) : '0.00'}</p>
      </section>

      <section className="btc-price">
        <h2>Current BTC Price</h2>
        <p>{btcPrice ? `$${btcPrice}` : 'Loading...'}</p>
      </section>

      <section className="investments">
        <h2>Your Investments</h2>
        {investments.length === 0 ? (
          <p>No active investments</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Amount (BTC)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => (
                <tr key={inv._id}>
                  <td>{inv.planName}</td>
                  <td>{inv.amount}</td>
                  <td>{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
