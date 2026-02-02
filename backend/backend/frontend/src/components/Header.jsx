import { Link } from 'react-router-dom';

export default function Header() {
  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-indigo-400">TrustraCapital</div>
      <nav className="flex gap-4">
        <Link to="/" className="hover:text-indigo-400">Home</Link>
        <Link to="/dashboard" className="hover:text-indigo-400">Dashboard</Link>
        <Link to="/admin" className="hover:text-indigo-400">Admin</Link>
        <button onClick={logout} className="px-3 py-1 bg-red-600 rounded">Logout</button>
      </nav>
    </header>
  );
}
