import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Home, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setLoading(true);
    setError('');
    
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-24 sm:pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-100 to-transparent -z-10"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md pt-10 sm:pt-6 text-center">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Set New Password</h2>
        <p className="mt-2 text-sm text-gray-600 font-medium">
          Choose a strong password you haven't used before.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 sm:px-10 rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-gray-100">
          
          {success ? (
            <div className="text-center animate-fade-in">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h3>
              <p className="text-gray-600 mb-4">
                Your password has been successfully updated.
              </p>
              <p className="text-sm text-gray-500">Redirecting to login page...</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-indigo-200 text-lg font-bold text-white bg-primary hover:bg-indigo-700 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
