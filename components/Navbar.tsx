import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Atom, LogIn, LogOut, User } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../services/AuthContext';

// Fix for Framer Motion types
const MotionSpan = motion.span as any;

const TITLES = [
  { text: "Vijnana Lab", lang: "en", sub: "Experience Science" },
  { text: "विज्ञान लैब", lang: "hi", sub: "विज्ञान का अनुभव करें" },
  { text: "ವಿಜ್ಞಾನ ಲ್ಯಾಬ್", lang: "kn", sub: "ವಿಜ್ಞಾನವನ್ನು ಅನುಭವಿಸಿ" }
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ SINGLE SOURCE OF TRUTH
  const { user, role } = useAuth();

  const isActive = (path: string) => location.pathname === path;


  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-effect border-b border-white/5 h-20 px-6 md:px-12 flex items-center justify-between transition-colors duration-300">
      {/* Logo */}
      <Link to="/home" className="flex items-center gap-3 group">
        <div className="relative">
          <Atom className="w-10 h-10 text-cyan-400 relative z-10 transition-transform group-hover:rotate-180 duration-1000 ease-in-out" />
        </div>
        <div className="flex flex-col justify-center">
            <span className="text-xl md:text-2xl font-bold text-white tracking-tight leading-none">
              Vijnana <span className="text-cyan-400">Lab</span>
            </span>
        </div>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`relative text-sm font-medium transition-colors duration-300 ${isActive(item.path)
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300'
              }`}
          >
            {item.label}
            {isActive(item.path) && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </Link>
        ))}
        {user && (
          <Link
            to={role === 'Teacher' ? '/teacher-dashboard' : '/student-dashboard'}
            className={`relative text-sm font-medium transition-colors duration-300 ${isActive('/student-dashboard') || isActive('/teacher-dashboard')
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300'
              }`}
          >
            Dashboard
            {(isActive('/student-dashboard') || isActive('/teacher-dashboard')) && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </Link>
        )}
      </div>

      {/* Auth Button */}
      <div className="hidden md:flex items-center">
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.displayName?.charAt(0) || <User size={14} />}
                </div>
              )}
              <span className="text-sm text-slate-600 dark:text-gray-400 hidden lg:inline">
                {user.displayName?.split(' ')[0] || 'Profile'}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-red-500/10 text-sm font-bold transition-all flex items-center gap-2"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link to="/login">
            <button className="btn-primary">
              <LogIn size={16} /> Log In
            </button>
          </Link>
        )}
      </div>

      {/* Mobile Toggle */}
      <button
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full glass-nav flex flex-col p-6 gap-4 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium"
            >
              {item.label}
            </Link>
          ))}

          <hr />

          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600/10 text-red-600 font-bold"
            >
              <LogOut size={18} /> Log Out
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 text-white font-bold"
            >
              <LogIn size={18} /> Log In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
