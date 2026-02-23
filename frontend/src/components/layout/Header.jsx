import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // adjust path if needed

export default function Header() {
  const { user, logout: contextLogout } = useAuth(); // Assume your context provides user & logout
  const navigate = useNavigate();

  const handleLogout = () => {
    contextLogout();               // Clears auth state/token in context
    localStorage.removeItem('token'); // If you still use localStorage
    navigate('/login', { replace: true }); // Clean redirect via React Router
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      {/* Logo */}
      <Link to="/" className="text-2xl font-black text-yellow-500 hover:text-yellow-400 transition">
        TrustraCapital
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-6">
        <Link to="/" className="hover:text-yellow-400 transition">Home</Link>

        {user ? (
          // Logged-in state
          <>
            <Link to="/dashboard" className="hover:text-yellow-400 transition">Dashboard</Link>
            
            {user.isAdmin || user.role === 'admin' ? (
              <Link to="/admin" className="hover:text-yellow-400 transition">Admin</Link>
            ) : null}

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-medium transition"
            >
              Logout
            </button>
          </>
        ) : (
          // Logged-out state → this is what was missing!
          <>
            <Link to="/login" className="hover:text-yellow-400 transition font-medium">
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-md transition"
            >
              Create Account
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
