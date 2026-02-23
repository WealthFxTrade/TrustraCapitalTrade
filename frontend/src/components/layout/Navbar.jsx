import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, DollarSign, ShieldCheck } from 'lucide-react';
// 1. Import the hook
import { useAuth } from '../context/AuthContext'; 

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // 2. Consume the context directly
  const { user, logout, initialized } = useAuth();
  
  // Logic helpers
  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || user?.role === 'admin';
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/plans', label: 'Investment Plans' },
    { path: '/reviews', label: 'Testimonials' },
  ];

  return (
    <nav className="bg-[#020617] border-b border-white/5 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-600/20 group-hover:scale-105 transition-transform">
               <DollarSign className="h-6 w-6 text-black font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white uppercase tracking-tighter italic">Trustra</span>
              <span className="text-[8px] text-yellow-600 font-bold tracking-[0.3em] uppercase -mt-1">Capital Trade</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[11px] font-black uppercase tracking-widest transition-all ${
                  isActive(link.path) ? 'text-yellow-500' : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth Section */}
            {initialized && (
              isAuthenticated ? (
                <div className="flex items-center space-x-6 pl-6 border-l border-white/10">
                  <Link
                    to={isAdmin ? "/admin" : "/dashboard"}
                    className="flex items-center text-xs font-black uppercase tracking-widest text-slate-300 hover:text-yellow-500 transition-colors"
                  >
                    {isAdmin ? <ShieldCheck className="h-4 w-4 mr-2" /> : <User className="h-4 w-4 mr-2" />}
                    {isAdmin ? 'Admin Node' : 'Dashboard'}
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center text-xs font-black uppercase tracking-widest text-red-500/80 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Exit
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95"
                  >
                    Register
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (Trustra Styled) */}
      {isOpen && (
        <div className="md:hidden bg-[#020617] border-b border-white/5 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-4 pb-8 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] ${
                  isActive(link.path)
                    ? 'bg-yellow-600/10 text-yellow-500 border border-yellow-600/20'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-white/5">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-slate-300 bg-white/5"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3 text-yellow-600" />
                    Secure Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full flex items-center px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-red-500 bg-red-500/5"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Terminate Session
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="flex items-center justify-center py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white border border-white/10"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-white text-black"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

