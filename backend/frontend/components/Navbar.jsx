import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-slate-900">
      <Link to="/" className="text-xl font-bold">
        TrustraCapitalTrade
      </Link>

      <div className="flex gap-4 items-center">
        {!user ? (
          <>
            <Link to="/login" className="text-gray-300 hover:text-white">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-accent text-black px-4 py-2 rounded-md font-semibold"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="text-gray-300 hover:text-white">
              Dashboard
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="text-gray-300 hover:text-white">
                Admin
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-red-500 px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
