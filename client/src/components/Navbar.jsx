import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="h-14 bg-dark-800/90 backdrop-blur-xl border-b border-dark-400/15 flex items-center justify-between px-5 sticky top-0 z-50">
      <Link to="/dashboard" className="flex items-center gap-3 group">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border border-accent/20
                          shadow-lg shadow-accent/25 group-hover:shadow-accent/40 transition-all duration-300 group-hover:scale-105">
            <img src="/logo.png" alt="DevInsight Logo" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-accent to-purple-500 rounded-xl opacity-0 group-hover:opacity-30
                          blur-md transition-opacity duration-300 pointer-events-none" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
            DevInsight
          </span>
          <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-medium leading-tight">
            AI Code Reviewer
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-5">
        {location.pathname !== '/dashboard' && (
          <Link to="/dashboard"
                className="text-xs text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1.5
                           bg-dark-700/50 px-3 py-1.5 rounded-lg border border-dark-400/20 hover:border-dark-400/40">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
        )}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 bg-dark-700/30 px-3 py-1.5 rounded-lg border border-dark-400/10">
              <div className="w-7 h-7 bg-gradient-to-br from-accent/30 to-purple-500/30 rounded-lg flex items-center justify-center
                              ring-1 ring-accent/20">
                <span className="text-xs font-bold text-accent-light">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-300 font-medium">{user.name}</span>
            </div>
            <button onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-red-400 transition-all duration-200
                               bg-dark-700/30 px-3 py-1.5 rounded-lg border border-dark-400/10 hover:border-red-500/20
                               hover:bg-red-500/5">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
