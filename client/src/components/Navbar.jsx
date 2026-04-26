import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, ShieldCheck, Building, Menu, X } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';
  const navBg = scrolled || !isHome ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent';
  const textColor = scrolled || !isHome ? 'text-gray-900' : 'text-white';
  const logoColor = scrolled || !isHome ? 'text-primary' : 'text-white';

  return (
    <nav className={`fixed w-full z-[60] transition-all duration-300 ${navBg}`}>
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link to={user?.role === 'admin' ? '/superadmin' : user?.role === 'owner' ? '/admin' : '/dashboard'} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors ${!scrolled && isHome ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:text-primary hover:bg-indigo-50'}`}>
                  {user?.role === 'admin' ? <ShieldCheck className="h-4 w-4" /> : user?.role === 'owner' ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  <span>{user?.role === 'admin' ? 'Super Admin' : user?.role === 'owner' ? 'Owner Dashboard' : 'Dashboard'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors ${!scrolled && isHome ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:text-red-500 hover:bg-red-50'}`}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-xl transition-colors ${!scrolled && isHome ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'}`}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="md:hidden animate-slide-up bg-white border-b border-gray-100 shadow-xl overflow-hidden absolute w-full top-20 left-0">
          <div className="px-4 pt-4 pb-8 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-3 bg-gray-50 rounded-2xl mb-4">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Signed in as</p>
                  <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                </div>
                <Link 
                  to={user?.role === 'admin' ? '/superadmin' : user?.role === 'owner' ? '/admin' : '/dashboard'} 
                  className="flex items-center gap-3 px-4 py-4 rounded-2xl text-gray-700 font-bold hover:bg-indigo-50 hover:text-primary transition-all"
                >
                  {user?.role === 'admin' ? <ShieldCheck className="h-5 w-5" /> : user?.role === 'owner' ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  {user?.role === 'admin' ? 'Super Admin' : user?.role === 'owner' ? 'Owner Dashboard' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-red-600 font-bold hover:bg-red-50 transition-all text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center justify-center w-full px-4 py-4 rounded-2xl text-gray-700 font-bold hover:bg-gray-100 transition-all">
                  Log in
                </Link>
                <Link to="/register" className="flex items-center justify-center w-full px-4 py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
