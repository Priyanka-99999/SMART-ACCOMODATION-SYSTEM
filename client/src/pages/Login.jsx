import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building2, ShieldCheck, ArrowRight, Home, Eye, EyeOff, AlertCircle, XCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const ROLES = [
  {
    key: 'user',
    label: 'Tenant',
    subtitle: 'Looking for a PG or hostel',
    icon: User,
    color: 'indigo',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    activeBg: 'bg-indigo-600',
    ring: 'ring-indigo-500',
  },
  {
    key: 'owner',
    label: 'PG Owner',
    subtitle: 'Manage your listings',
    icon: Building2,
    color: 'emerald',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    activeBg: 'bg-emerald-600',
    ring: 'ring-emerald-500',
  },
  {
    key: 'admin',
    label: 'Super Admin',
    subtitle: 'Verify & manage platform',
    icon: ShieldCheck,
    color: 'violet',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    activeBg: 'bg-violet-600',
    ring: 'ring-violet-500',
  },
];

const Login = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const { login, loading, error, isAuthenticated, user, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  useEffect(() => {
    // If we're specifically on the admin portal URL, do NOT auto-redirect based on old sessions
    const isAdminUrl = new URLSearchParams(window.location.search).get('role') === 'admin';
    
    if (isAuthenticated && user) {
      if (isAdminUrl) {
        if (user.role === 'admin') navigate('/superadmin');
        // If logged in as something else on the admin URL, stay here and show the login form
        return;
      }

      // Normal redirection for non-admin-portal views
      if (user.role === 'admin') navigate('/superadmin');
      else if (user.role === 'owner') navigate('/admin');
      else navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const activeRoleConfig = ROLES.find(r => r.key === selectedRole);

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    // Password validation: Strict rules for login ONLY for non-admins
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }

    if (selectedRole !== 'admin') {
      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
      if (!specialCharRegex.test(password)) {
        setValidationError('Password must contain at least one special character');
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(email, password, selectedRole);
    } catch (err) {
      // Error handled in store
    }
  };

  useEffect(() => {
    const isAdminParam = new URLSearchParams(window.location.search).get('role') === 'admin';
    if (isAdminParam) {
      setSelectedRole('admin');
    }
  }, []);

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setEmail('');
    setPassword('');
    setValidationError('');
    useAuthStore.setState({ error: null });
  };

  const isAdminView = new URLSearchParams(window.location.search).get('role') === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-24 sm:pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg pt-10 sm:pt-0">
        <h2 className="text-center text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Welcome back</h2>
        <p className="mt-2 text-center text-sm sm:text-base text-gray-500 font-medium">
          {isAdminView ? 'Super Admin Portal' : 'Select your role to continue'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        {/* Role Selector Cards */}
        <div className={`grid ${isAdminView ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-2'} gap-3 sm:gap-4 mb-6 sm:mb-8`}>
          {ROLES.filter(role => {
            if (isAdminView) return role.key === 'admin';
            return role.key !== 'admin';
          }).map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.key;
            return (
              <button
                key={role.key}
                onClick={() => handleRoleSelect(role.key)}
                className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-5 rounded-2xl border-2 transition-all duration-300 font-medium text-xs sm:text-sm ${
                  isSelected
                    ? `${role.border} ${role.bg} ring-2 ${role.ring} ring-offset-2 shadow-lg scale-[1.02]`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${isSelected ? role.iconBg : 'bg-gray-50'}`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isSelected ? role.iconColor : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className={`font-black text-center leading-tight ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>{role.label}</p>
                  <p className="text-[10px] text-gray-400 text-center leading-tight mt-1 hidden sm:block">{role.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Login Form — visible once role selected */}
        {selectedRole && activeRoleConfig && (
          <div className={`bg-white py-8 px-6 sm:px-10 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 animate-slide-up ${validationError ? 'animate-shake' : ''}`}>
            <div className={`flex items-center gap-3 mb-6 p-4 rounded-xl ${activeRoleConfig.bg} border ${activeRoleConfig.border}`}>
              <div className={`p-2 rounded-lg ${activeRoleConfig.iconBg}`}>
                {(() => { const RoleIcon = activeRoleConfig.icon; return <RoleIcon className={`h-5 w-5 ${activeRoleConfig.iconColor}`} />; })()}
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-sm">Logging in as {activeRoleConfig.label}</p>
                <p className="text-xs text-gray-500">{activeRoleConfig.subtitle}</p>
              </div>
            </div>

            {(error || validationError) && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm font-bold flex items-center gap-2 animate-fade-in">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{validationError || error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 ${validationError && validationError.toLowerCase().includes('email') ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-bold text-gray-700">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary hover:text-indigo-700">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 ${validationError && validationError.toLowerCase().includes('password') ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl text-base font-bold text-white bg-primary hover:bg-indigo-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? 'Logging in...' : (
                  <>Login as {activeRoleConfig.label} <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </form>

            {!isAdminView && (
              <p className="mt-6 text-center text-sm text-gray-500 font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-primary hover:text-indigo-700 transition-colors">
                  Sign up here
                </Link>
              </p>
            )}
            {isAdminView && (
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-widest font-bold">Account Stuck?</p>
                <button 
                  onClick={() => { useAuthStore.getState().logout(); window.location.reload(); }}
                  className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-2 mx-auto px-4 py-2 bg-gray-50 rounded-lg hover:bg-indigo-50"
                >
                  <XCircle className="h-4 w-4" /> Sign Out & Refresh
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
