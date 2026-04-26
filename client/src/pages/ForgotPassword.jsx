import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-24 sm:pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-100 to-transparent -z-10"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md pt-10 sm:pt-6 text-center">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-600 font-medium">
          Enter your email and we'll send you a link to reset your password.
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
              <p className="text-gray-600 mb-8">
                We've sent a password reset link to <span className="font-bold">{email}</span>.
              </p>
              <Link to="/login" className="flex items-center justify-center gap-2 text-primary font-bold hover:text-indigo-700">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
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
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-indigo-200 text-lg font-bold text-white bg-primary hover:bg-indigo-700 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
