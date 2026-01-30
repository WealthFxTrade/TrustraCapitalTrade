import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await API.post('/auth/register', {
        fullName,
        email,
        password,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={submit} className="bg-slate-900 p-8 rounded-xl w-96">
        <h2 className="text-2xl font-bold mb-6">Create Account</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-4 p-3 rounded bg-slate-800"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 rounded bg-slate-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded bg-slate-800"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-accent text-black py-3 rounded font-semibold">
          Sign Up
        </button>
      </form>
    </div>
  );
}
