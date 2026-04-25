import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building2, ShieldCheck, ArrowRight, Home } from 'lucide-react';
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
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const activeRoleConfig = ROLES.find(r => r.key === selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      const actualRole = useAuthStore.getState().user?.role;

      // Validate selected role matches actual account role
      if (selectedRole !== actualRole) {
        const roleLabels = { user: 'Tenant', owner: 'PG Owner', admin: 'Super Admin' };
        useAuthStore.getState().logout();
        useAuthStore.setState({
          error: `This account is a "${roleLabels[actualRole] || actualRole}". Please select the correct role card above.`
        });
        return;
      }

      if (actualRole === 'admin') navigate('/superadmin');
      else if (actualRole === 'owner') navigate('/admin');
      else navigate('/');
    } catch (err) {
      // Error handled in store
    }
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2.5 bg-indigo-100 rounded-2xl group-hover:bg-indigo-200 transition-colors">
              <Home className="h-7 w-7 text-indigo-600" />
            </div>
            <span className="font-extrabold text-2xl text-gray-900 tracking-tight">Staysmart AI</span>
          </Link>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
        <p className="mt-2 text-center text-base text-gray-500 font-medium">
          Select your role to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        {/* Role Selector Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.key;
            return (
              <button
                key={role.key}
                onClick={() => handleRoleSelect(role.key)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 font-medium text-sm ${
                  isSelected
                    ? `${role.border} ${role.bg} ring-2 ${role.ring} ring-offset-1 shadow-md`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`p-3 rounded-xl ${isSelected ? role.iconBg : 'bg-gray-100'}`}>
                  <Icon className={`h-6 w-6 ${isSelected ? role.iconColor : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className={`font-bold text-center leading-tight ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>{role.label}</p>
                  <p className="text-xs text-gray-400 text-center leading-tight mt-0.5 hidden sm:block">{role.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Login Form — visible once role selected */}
        {selectedRole && (
          <div className="bg-white py-8 px-6 sm:px-10 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 animate-slide-up">
            <div className={`flex items-center gap-3 mb-6 p-4 rounded-xl ${activeRoleConfig.bg} border ${activeRoleConfig.border}`}>
              <div className={`p-2 rounded-lg ${activeRoleConfig.iconBg}`}>
                {(() => { const Icon = activeRoleConfig.icon; return <Icon className={`h-5 w-5 ${activeRoleConfig.iconColor}`} />; })()}
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-sm">Logging in as {activeRoleConfig.label}</p>
                <p className="text-xs text-gray-500">{activeRoleConfig.subtitle}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm font-bold text-center">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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

            <p className="mt-6 text-center text-sm text-gray-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primary hover:text-indigo-700 transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        )}


      </div>
    </div>
  );
};

export default Login;
