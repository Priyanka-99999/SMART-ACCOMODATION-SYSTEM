import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, ShieldCheck, Building } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';
  const navBg = scrolled || !isHome ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100' : 'bg-transparent';
  const textColor = scrolled || !isHome ? 'text-gray-900' : 'text-white';
  const logoColor = scrolled || !isHome ? 'text-primary' : 'text-white';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`p-2 rounded-xl transition-colors ${scrolled || !isHome ? 'bg-primary/10 group-hover:bg-primary/20' : 'bg-white/20 group-hover:bg-white/30'}`}>
              <Home className={`h-6 w-6 ${logoColor} transform group-hover:-translate-y-0.5 transition-transform`} />
            </div>
            <span className={`font-extrabold text-2xl tracking-tight ${textColor}`}>
              Staysmart <span className="font-medium opacity-80">AI</span>
            </span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link to={user?.role === 'admin' ? '/superadmin' : user?.role === 'owner' ? '/admin' : '/dashboard'} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors ${!scrolled && isHome ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:text-primary hover:bg-indigo-50'}`}>
                  {user?.role === 'admin' ? <ShieldCheck className="h-4 w-4" /> : user?.role === 'owner' ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  <span className="hidden sm:inline">{user?.role === 'admin' ? 'Super Admin' : user?.role === 'owner' ? 'Owner Dashboard' : 'Dashboard'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors ${!scrolled && isHome ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:text-red-500 hover:bg-red-50'}`}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`px-5 py-2.5 text-sm font-bold transition-colors ${!scrolled && isHome ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-primary'}`}>
                  Log in
                </Link>
                <Link to="/register" className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-transform hover:-translate-y-0.5 shadow-md hover:shadow-lg ${!scrolled && isHome ? 'bg-white text-primary hover:bg-gray-50' : 'bg-primary text-white hover:bg-indigo-700'}`}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
