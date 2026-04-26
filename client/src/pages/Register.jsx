import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Eye, EyeOff, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const { register, loading, error, isAuthenticated, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') navigate('/superadmin');
      else if (role === 'owner') navigate('/admin');
      else navigate('/'); 
    }
  }, [isAuthenticated, navigate, role]);

  const validateForm = () => {
    // Name validation: Letters only, at least 3 characters
    const nameRegex = /^[a-zA-Z\s]{3,}$/;
    if (!nameRegex.test(name)) {
      setValidationError('Name must be at least 3 characters and contain only letters (no numbers)');
      return false;
    }

    // Email validation: Proper format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    // Password validation: Min 6 characters
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }
    
    // Strict rule ONLY for Tenant and Owner
    if (role === 'user' || role === 'owner') {
      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
      if (!specialCharRegex.test(password)) {
        setValidationError('Password must contain at least one special character (!@#$%^&* etc.)');
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
      await register(name, email, password, role, phone);
    } catch (err) {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-24 sm:pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-100 to-transparent -z-10"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md pt-10 sm:pt-4">
        <h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:text-indigo-700 transition-colors">
            Log in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className={`bg-white py-10 px-6 sm:px-10 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 animate-slide-up ${validationError ? 'animate-shake' : ''}`}>
          
          {(error || validationError) && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm font-bold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 ${validationError && validationError.toLowerCase().includes('name') ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationError) setValidationError('');
                }}
              />
            </div>
            
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
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
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
              <p className="mt-1.5 text-[10px] text-gray-400 font-medium ml-1">Minimum 6 characters</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">I am a...</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 font-medium cursor-pointer"
              >
                <option value="user">Tenant (Looking for stay)</option>
                <option value="owner">PG Owner (Listing properties)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-indigo-200 text-lg font-bold text-white bg-primary hover:bg-indigo-700 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 mt-4"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
